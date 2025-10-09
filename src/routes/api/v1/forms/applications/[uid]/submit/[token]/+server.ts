import { errorMessageWithCode } from "$lib";
import { FormApplicationSubmissionQuery } from "$lib/server/db/query";
import { error, type RequestHandler, json } from "@sveltejs/kit";

export const GET: RequestHandler = async (event) => {
  const query = new FormApplicationSubmissionQuery();
  const submission = await query.submissionViaToken(event);
  if (!submission) {
    throw error(404, "GET: Submission not found");
  }
  return json(submission);
};

export const PUT: RequestHandler = async (event) => {
  const query = new FormApplicationSubmissionQuery();
  const submission = await query.submissionViaToken(event);
  if (!submission) {
    throw error(404, "PUT:Submission not found");
  }
  try {
    const body = (await event.request.json()) as Record<string, any>;
    const savedSubmission = await query.update(
      { values: body },
      { uid: submission.uid },
    );
    return json(savedSubmission);
  } catch (e: any) {
    console.error("Put Submission Error", e);
    const message = errorMessageWithCode(e.message);
    throw error(message.code, message.message);
  }
};

export const DELETE: RequestHandler = async (event) => {
  const query = new FormApplicationSubmissionQuery();
  const submission = await query.submissionViaToken(event);
  if (!submission) {
    throw error(404, "DELETE:Submission not found");
  }
  try {
    const form = await query.destroy({ uid: submission.uid });
    return json(form);
  } catch (e: any) {
    throw error(500, e.message);
  }
};

export const POST: RequestHandler = async (event) => {
  const query = new FormApplicationSubmissionQuery();
  const submission = await query.submissionViaToken(event);
  if (!submission) {
    throw error(404, "POST:Submission not found");
  }
  if (!submission.draft) {
    throw error(
      400,
      "Submission is not in draft state and cannot be rewritten",
    );
  }
  try {
    const body = (await event.request.json()) as Record<string, any>;
    const form = await query.update(
      { values: body, draft: false },
      { uid: submission.uid },
    );
    return json(Array.isArray(form) ? form.pop() : form);
  } catch (e: any) {
    throw error(500, e.message);
  }
};
