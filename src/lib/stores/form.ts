// src/lib/stores/form.ts
import { writable, derived } from "svelte/store";

export function createFormStore(initialData: Record<string, any>) {
  const formData = writable({ ...initialData });

  const isDirty = derived(formData, ($formData) =>
    Object.keys(initialData).some((key) => $formData[key] !== initialData[key]),
  );

  const isValid = derived(formData, ($formData) => {
    // Add your custom validation logic here
    return Object.keys($formData).every(
      (key) => $formData[key].trim().length > 0,
    );
  });

  return { formData, isDirty, isValid };
}
