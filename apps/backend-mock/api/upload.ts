import { eventHandler, readMultipartFormData } from "h3";
import { verifyAccessToken } from "~/utils/jwt-utils";
import { unAuthorizedResponse, useResponseSuccess } from "~/utils/response";

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  const parts = await readMultipartFormData(event);
  const file = parts?.find((part) => part.name === "file");
  return useResponseSuccess({
    url: file?.type?.startsWith("video/")
      ? "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      : "https://unpkg.com/@vbenjs/static-source@0.1.7/source/logo-v1.webp",
  });
});
