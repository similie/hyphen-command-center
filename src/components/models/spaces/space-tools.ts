import { humanizeNumber } from "$lib";

export const formatCountForRestrictions = (modelValue: number) => {
  if (modelValue < 0) {
    return "Unlimited";
  } else if (modelValue === 0) {
    return "Restricted";
  }
  return humanizeNumber(modelValue);
};
