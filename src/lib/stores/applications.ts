import type { ApplicationModel } from "$lib/types/models";
import { persistent } from "./persistent";

import { writable } from "svelte/store";
export const userApplications = () =>
  persistent<Record<string, string>>("user-applications", {});

export const applicationStore = writable<ApplicationModel[]>([]);
