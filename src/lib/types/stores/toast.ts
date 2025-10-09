export enum ToastType {
  Error = "error",
  Success = "success",
  Info = "info",
  Warning = "warning",
  Custom = "custom",
}
export type IToast = {
  message: string;
  type: ToastType;
  duration?: number;
  id?: string;
  templates?: string;
};
