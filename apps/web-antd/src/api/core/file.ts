import { requestClient } from "#/api/request";

export const uploadEditorMedia = async (file: File, onProgress?: (percent: number) => void) => {
  const result = await requestClient.upload<{ url: string }>(
    "/file/upload",
    { file, module: "rich-text" },
    {
      onUploadProgress: ({ loaded, total }) => {
        if (total) onProgress?.(Math.round((loaded / total) * 100));
      },
    },
  );
  return result.url;
};
