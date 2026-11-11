/**
 * Answers Twenty's `createFileUpload` / `completeFileUpload` GraphQL mutations with Supabase Storage so the
 * vendored `useDirectFileUpload` + `SettingsImageInput` run unmodified:
 *   createFileUpload   -> signed upload URL for the `people-images` bucket
 *   (upstream PUTs the file to that URL)
 *   completeFileUpload -> public URL of the stored image
 */
export const PEOPLE_BUCKET = 'people-images';
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const TYPES: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp' };

export interface StorageLike {
  createSignedUploadUrl(path: string): Promise<{ data: { signedUrl: string; path: string } | null; error: { message: string } | null }>;
  getPublicUrl(path: string): { data: { publicUrl: string } };
}

let folder = 'misc';
/** Which sub-folder the next upload goes into (contacts / team / companies). */
export const setUploadFolder = (f: string) => { folder = f.replace(/[^a-z0-9_-]/gi, '') || 'misc'; };

export const defaultStorage = async (): Promise<StorageLike> => {
  const { supabase } = await import('../../lib/supabase');
  return supabase.storage.from(PEOPLE_BUCKET) as unknown as StorageLike;
};

export const validateImage = (filename: string, size: number): { ext: string; contentType: string } => {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const contentType = TYPES[ext];
  if (!contentType) throw new Error('Only JPEG, PNG, GIF or WebP images are supported');
  if (size > MAX_IMAGE_BYTES) throw new Error('Image must be under 10MB');
  return { ext, contentType };
};

export const resolveCreateFileUpload = async (vars: { filename: string; size: number }, storage?: StorageLike) => {
  const { ext, contentType } = validateImage(vars.filename, vars.size);
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const store = storage ?? (await defaultStorage());
  const { data, error } = await store.createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? 'Could not start the upload');
  return {
    __typename: 'FileUploadTarget',
    fileId: data.path,
    uploadUrl: data.signedUrl,
    contentType,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  };
};

export const resolveCompleteFileUpload = async (vars: { fileId: string }, storage?: StorageLike) => {
  const store = storage ?? (await defaultStorage());
  const { data } = store.getPublicUrl(vars.fileId);
  return { __typename: 'FileWithSignedUrl', id: vars.fileId, path: vars.fileId, size: 0, createdAt: new Date().toISOString(), url: data.publicUrl };
};
