export interface UploadOptions {
  uploadPath: string;
  fieldName?: string;
  maxCount?: number;
  allowedMimeTypes?: string[];
  maxFileSize?: number;
}
