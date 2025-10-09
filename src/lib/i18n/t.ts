import {
  register,
  init,
  getLocaleFromNavigator,
  unwrapFunctionStore,
  format,
} from "svelte-i18n";
export const AvailableLanguages = [{ key: "en-US", name: "English US" }];

export const loadI18n = async () => {
  for (const lang of AvailableLanguages) {
    register(lang.key, () => import(`./locales/${lang.key}.json`));
  }

  await init({
    fallbackLocale: "en-US",
    initialLocale: getLocaleFromNavigator(),
  });
};

export { _ as _t } from "svelte-i18n";
export const t = (key: string, options: any = {}) => {
  const $format = unwrapFunctionStore(format);
  return $format(key, options);
};

export const getCurrentLanguage = (): string => {
  const locale = getLocaleFromNavigator(); // Get the current locale
  return locale || AvailableLanguages[0].key;
};

export const getShortLocale = (): string => {
  return getCurrentLanguage().split("-")[0];
};
