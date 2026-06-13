export function buildFormData(fields = {}, files = {}) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  Object.entries(files).forEach(([fieldName, fileList]) => {
    const list = Array.isArray(fileList) ? fileList : [fileList];
    list.forEach((file) => {
      if (file) {
        formData.append(fieldName, file);
      }
    });
  });

  return formData;
}

export const multipartHeaders = () => ({
  headers: { "Content-Type": "multipart/form-data" },
});

