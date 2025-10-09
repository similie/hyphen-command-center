import { ToastType, ToastModels, type IToast } from "$lib";
import { v4 } from "uuid";

export const DEFAULT_TOAST_DURATION = 10000;

const buildCostToast = (message: string, duration: number, type: ToastType) => {
  ToastModels.update((toasts: IToast[]) => {
    toasts = toasts || [];
    toasts.push({
      message,
      duration,
      type,
      id: v4(),
    });
    return toasts;
  });
};

export const Toast = {
  error: (message: string, duration = DEFAULT_TOAST_DURATION) =>
    buildCostToast(message, duration, ToastType.Error),
  info: (message: string, duration = DEFAULT_TOAST_DURATION) =>
    buildCostToast(message, duration, ToastType.Info),
  success: (message: string, duration = DEFAULT_TOAST_DURATION) =>
    buildCostToast(message, duration, ToastType.Success),
  warning: (message: string, duration = DEFAULT_TOAST_DURATION) =>
    buildCostToast(message, duration, ToastType.Warning),
};
