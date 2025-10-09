import {
  AppDocsQuery,
  RegistrationQuery,
  UserQuery,
} from "$lib/server/db/query";
import { error, json, type RequestHandler } from "@sveltejs/kit";
import { isUUID, type ApplicationDocumentModel, type UUID } from "$lib";

export const DELETE: RequestHandler = async (event) => {
  const sessionUser = await UserQuery.sessionUser(event);

  if (!sessionUser) {
    throw error(401, "Unauthorized");
  }

  const { documents } = (await event.request.json()) as { documents: UUID[] };
  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    throw error(400, "A list of document UUIDs is required");
  }

  try {
    const filteredDocs = documents.filter((d) => isUUID(d));
    const query = new AppDocsQuery();
    const results = await query.findManyByUid(
      filteredDocs as UUID[],
      sessionUser,
    );
    const deletableDocs = results.map((doc) => doc.uid);
    const sendDestroyed: ApplicationDocumentModel[] = [];
    for (const uid of deletableDocs) {
      const destroyed = await query.destroy({ uid });
      if (!destroyed || !destroyed.length) {
        continue;
      }
      sendDestroyed.push(...destroyed);
    }
    return json(query.terminateExpendables(sendDestroyed));
  } catch (e) {
    console.error("Error deleting documents:", e);
    throw error(500, "Internal Server Error");
  }
};

export const GET: RequestHandler = async (event) => {
  const sessionUser = await UserQuery.sessionUser(event);

  if (!sessionUser) {
    throw error(401, "Unauthorized");
  }

  const url = new URL(event.request.url);
  const documents = url.searchParams.get("documents");
  if (!documents) {
    throw error(400, "A document UUID is required");
  }

  const docIds = documents
    .split(",")
    .map((uid) => uid.trim())
    .filter((d) => isUUID(d));
  try {
    const query = new AppDocsQuery();
    const results = await query.findManyByUid(docIds as UUID[], sessionUser);
    return json(results);
  } catch (e) {
    console.error("Error fetching documents:", e);
    throw error(500, "Internal Server Error");
  }
};

export const POST: RequestHandler = async (event) => {
  try {
    const sessionUser = await UserQuery.sessionUser(event);

    if (!sessionUser) {
      throw error(401, "Unauthorized");
    }

    const body = {
      token: event.request.headers.get("token") as UUID,
      role: event.request.headers.get("Property-Role") || sessionUser.role,
    };
    const rq = new RegistrationQuery();
    const session = await event.locals.auth();
    const unrestricted = await rq.restrictedAccess(sessionUser, body);
    if (!unrestricted) {
      throw error(401, "Unauthorized");
    }
    const formData = await event.request.formData();
    const files = formData.getAll("files"); // 'files' is the key used in the FormData
    const query = new AppDocsQuery();
    const results = await query.buildFile(
      files,
      body.token || session?.user.uid,
      +body.role,
    );
    return json(results);
  } catch (e: any) {
    console.error("Conversation Starter Error", e);
    throw error(500, e.message);
  }
};
