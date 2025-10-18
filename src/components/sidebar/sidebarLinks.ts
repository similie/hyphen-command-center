import { UserRoles, type SidebarLink } from "$lib";
import {
  DatabaseOutline,
  UserAddOutline,
  ClipboardOutline,
  DrawSquareOutline,
  WandMagicSparklesOutline,
  ShapesOutline,
} from "flowbite-svelte-icons";
import SideBarSimilie from "./SideBarSimilie.svelte";

export function loadLinks(): { links: SidebarLink[] } {
  return {
    links: [
      {
        type: "item",
        href: "/devices",
        label: "Devices",
        classes: "",
        name: "devices",
        icon: WandMagicSparklesOutline,
        role: UserRoles.UNRESTRICTED,
      },

      {
        type: "item",
        href: "/users",
        label: "Users",
        icon: UserAddOutline,
        name: "users",
        classes: "",
        role: UserRoles.USER_MANAGER,
        links: [],
      },

      {
        type: "item",
        href: "/about",
        label: "About",
        icon: SideBarSimilie,
        name: "about",
        classes: "",
        role: UserRoles.UNRESTRICTED,
        links: [],
      },

      {
        type: "wrapper",
        label: "Administration",
        icon: DatabaseOutline,
        name: "admin",
        href: "/admin",
        role: UserRoles.USER_MANAGER,
        classes: "",
        links: [
          {
            type: "item",
            href: "/events",
            label: "Events",
            icon: ShapesOutline,
            name: "admin.events",
            classes: "",
            role: UserRoles.USER_MANAGER,
            links: [],
          },

          {
            type: "item",
            href: "/forwarders",
            label: "Forwarders",
            icon: ShapesOutline,
            name: "admin.forwarders",
            classes: "",
            role: UserRoles.USER_MANAGER,
            links: [],
          },

          {
            type: "item",
            href: "/spaces",
            label: "Spaces",
            icon: DrawSquareOutline,
            name: "admin.spaces",
            classes: "",
            role: UserRoles.USER_MANAGER,
            links: [],
          },

          {
            type: "item",
            href: "/forms",
            label: "Forms",
            icon: ClipboardOutline,
            name: "admin.forms",
            classes: "",
            role: UserRoles.USER_MANAGER,
            links: [],
          },

          {
            type: "item",
            href: "/settings",
            label: "Settings",
            icon: DatabaseOutline,
            name: "admin.settings",
            classes: "",
            role: UserRoles.ADMIN,
            links: [],
          },
        ],
      },
    ],
  };
}
