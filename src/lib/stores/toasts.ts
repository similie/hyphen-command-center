import type { IToast } from "$lib/types";
import { writable } from "svelte/store";

export const ToastModels = writable<IToast[]>([]);
