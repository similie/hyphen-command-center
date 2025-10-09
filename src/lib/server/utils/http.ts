import type { SiteConfig } from "$lib/types";
import { error, type RequestEvent, redirect } from "@sveltejs/kit";
import { Agent } from "https";

export const SendRedirect = (
  location: string,
  searchParams?: Record<string, string>,
) => {
  throw redirect(
    302,
    `${location}${searchParams ? "?" + new URLSearchParams(searchParams) : ""}`,
  );
};

export const siteUrl = (event: RequestEvent) => {
  return event.url.origin;
};

export const SendJson = (data: any) => {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const SendJsonError = (status: number, errorMessage: any): Response => {
  return error(status, JSON.stringify({ error: errorMessage }));
};

export const certificateDodgingAgent = (config: SiteConfig) => {
  if (config.applicationApi.startsWith("http://")) {
    return false;
  }
  return new Agent({
    rejectUnauthorized: false,
  });
};
