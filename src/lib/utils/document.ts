// import { browser } from "$app/environment";
export const isDarkMode = () => {
  return document.querySelector("html")?.classList.contains("dark");
};
let browserAvailable: boolean | null = null;
export const onDarkModeChange = async (cb: () => void): Promise<() => void> => {
  if (browserAvailable === null) {
    const { browser } = await import("$app/environment");
    browserAvailable = browser; // ensure client-side only
    if (!browserAvailable) return () => {}; // ensure client-side only
  }

  const html = document.documentElement;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        cb();
      }
    });
  });

  observer.observe(html, {
    attributes: true,
    attributeFilter: ["class"],
    attributeOldValue: true,
  });

  // Optionally return a cleanup function
  return () => observer.disconnect();
};
