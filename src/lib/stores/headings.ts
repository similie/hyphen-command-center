import type { CrumbHeading } from "$lib/types";
import { writable } from "svelte/store";

export const OpenMobileNavbar = writable<boolean>(false);

export const NavbarCrumbs = writable<CrumbHeading[]>([]);

export const addNavbarCrumb = (crumb: CrumbHeading[]) => {
  NavbarCrumbs.update((val) => {
    val.push(...crumb);
    return val;
  });
};

export const removeNavbarCrumb = (title: string[]) => {
  NavbarCrumbs.update((val) => {
    val = val.filter((v) => !title.includes(v.title));
    return val;
  });
};
