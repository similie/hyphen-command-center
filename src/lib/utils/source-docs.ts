export const appFileBase = (fileName: string, params?: any) => {
  return `/api/v1/documents/app/${fileName}${
    params ? "?" + new URLSearchParams(params).toString() : ""
  }`;
};

// 1. Convert File to Base64
export const fileToBase64 = (
  file: File,
): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file); // Converts the file to Base64
  });
};

// 2. Convert Base64 back to Blob
export const base64ToBlob = (
  base64Data: string,
  contentType = "",
  sliceSize = 512,
) => {
  const byteCharacters = atob(base64Data.split(",")[1]); // Decode Base64
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

// 3. Convert Blob back to File
export const blobToFile = (blob: Blob, fileName: string, mimeType: string) => {
  return new File([blob], fileName, { type: mimeType });
};
