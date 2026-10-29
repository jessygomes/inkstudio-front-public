import { createUploadthing, type FileRouter } from "uploadthing/next";
import {
  finishUpload,
  prepareUpload,
  uploadContextSchema,
} from "@/lib/upload-permits";
const f = createUploadthing();
export const fileRouter = {
  imageUploader: f(
    { image: { maxFileSize: "8MB", maxFileCount: 5 } },
    { presignedURLTTL: "10 minutes", awaitServerData: true },
  )
    .input(uploadContextSchema)
    .middleware(({ files, input }) =>
      prepareUpload("imageUploader", files, input),
    )
    .onUploadComplete(async ({ file, metadata }) => {
      await finishUpload(file, metadata);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;
export type OurFileRouter = typeof fileRouter;
