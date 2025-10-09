/** @type {import('tailwindcss').Config} */
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";

export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    // "./src/lib/server/email/templates/*.{svelte}",
    // "./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}",
    "./node_modules/flowbite-svelte-icons/**/*.{html,js,svelte,ts}",
    "./node_modules/@flowbite-svelte-plugins/**/*.{html,js,svelte,ts}",
  ],
  safelist: [
    // your color-picker layout inside TipTap
    "mb-3",
    "grid",
    "grid-cols-6",
    "gap-1",
    "gap-2",
    "group",
    "items-center",
    "rounded-lg",
    "p-1.5",
    "hover:bg-gray-100",
    "dark:hover:bg-gray-600",
    "col-span-3",
    "h-8",
    "w-full",
    "rounded-md",
    "border",
    "border-gray-200",
    "bg-gray-50",
    "p-px",
    "px-1",
    "group-hover:bg-gray-50",
    "hover:bg-gray-50",
    "dark:border-gray-600",
    "dark:bg-gray-700",
    "dark:group-hover:bg-gray-700",
    "dark:hover:bg-gray-700",
    "col-span-3",
    "text-sm",
    "font-medium",
    "text-gray-900",
    "group-hover:text-gray-900",
    "dark:text-white",
    "dark:group-hover:text-white",
    "h-6",
    "w-6",
    "rounded-md",
    "transition-transform",
    "duration-150",
    "hover:scale-110",
    "button",
    "text-gray-500",

    "p-2",
    // Flowbite-Svelte-Plugins typography utilities
    "format",
    "lg:format-lg",
    "format-primary-600",
    "format-invert",

    {
      pattern:
        /^(text|bg|border|font|leading|tracking|p|px|py|m|mx|my|w|h|max-w|rounded|shadow)-.+/,
    },
    { pattern: /^sm:.*$/ },
    { pattern: /^md:.*$/ },
    { pattern: /^lg:.*$/ },
    { pattern: /^xl:.*$/ },
    // Flowbite Typography presets you use:
  ],
  theme: {
    extend: {
      colors: {
        code: {
          dark: "#282c34",
        },
        primary: {
          50: "#e8fcff",
          100: "#d1f8ff",
          200: "#a3efff",
          300: "#75e6ff",
          400: "#40d9f5",
          500: "#19cee9",
          600: "#06c4de",
          700: "#05aac0",
          800: "#048da0",
          900: "#036c7a",
        },
      },
      keyframes: {
        spotlight: {
          "0%": {
            opacity: 0,
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        wobble: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "15%": { transform: "rotate(-15deg)" },
          "30%": { transform: "rotate(10deg)" },
          "45%": { transform: "rotate(-10deg)" },
          "60%": { transform: "rotate(6deg)" },
          "75%": { transform: "rotate(-4deg)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 2000ms ease-in-out forwards",
        wobble: "wobble 0.8s ease-in-out",
        spotlight: "spotlight 2s ease .75s 1 forwards",
      },
    },
  },
  darkMode: "class",
  plugins: [
    require("flowbite/plugin"),
    require("flowbite-typography"),
    addVariablesForColors,
  ],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
  );

  addBase({
    ":root": newVars,
  });
}
