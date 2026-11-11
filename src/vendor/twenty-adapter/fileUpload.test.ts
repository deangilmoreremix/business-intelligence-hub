import { describe, it, expect } from 'vitest';
import { MAX_IMAGE_BYTES, resolveCompleteFileUpload, resolveCreateFileUpload, setUploadFolder, validateImage, type StorageLike } from './fileUpload';

const calls: string[] = [];
const storage: StorageLike = {
  createSignedUploadUrl: async path => { calls.push(path); return { data: { signedUrl: `https://x.supabase.co/storage/v1/object/upload/sign/people-images/${path}?token=t`, path }, error: null }; },
  getPublicUrl: path => ({ data: { publicUrl: `https://x.supabase.co/storage/v1/object/public/people-images/${path}` } }),
};

describe('Supabase Storage adapter for Twenty file upload mutations', () => {
  it('createFileUpload returns a signed URL, content type and the storage path as fileId', async () => {
    setUploadFolder('contacts');
    const t = await resolveCreateFileUpload({ filename: 'Me.JPG', size: 1000 }, storage);
    expect(t.contentType).toBe('image/jpeg');
    expect(t.fileId).toMatch(/^contacts\/[0-9a-f-]{36}\.jpg$/);
    expect(t.uploadUrl).toContain('/object/upload/sign/people-images/contacts/');
    expect(new Date(t.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('completeFileUpload returns the public URL', async () => {
    const f = await resolveCompleteFileUpload({ fileId: 'team/abc.png' }, storage);
    expect(f.url).toBe('https://x.supabase.co/storage/v1/object/public/people-images/team/abc.png');
    expect(f.path).toBe('team/abc.png');
  });

  it('rejects non-images and oversize files before touching storage', async () => {
    calls.length = 0;
    await expect(resolveCreateFileUpload({ filename: 'virus.exe', size: 10 }, storage)).rejects.toThrow(/JPEG, PNG, GIF or WebP/);
    await expect(resolveCreateFileUpload({ filename: 'big.png', size: MAX_IMAGE_BYTES + 1 }, storage)).rejects.toThrow(/under 10MB/);
    expect(calls).toHaveLength(0);
    expect(validateImage('a.webp', 5).contentType).toBe('image/webp');
  });

  it('surfaces storage errors', async () => {
    const bad: StorageLike = { ...storage, createSignedUploadUrl: async () => ({ data: null, error: { message: 'bucket not found' } }) };
    await expect(resolveCreateFileUpload({ filename: 'a.png', size: 5 }, bad)).rejects.toThrow('bucket not found');
  });

  it('sanitises the folder name', async () => {
    setUploadFolder('../../etc');
    const t = await resolveCreateFileUpload({ filename: 'a.png', size: 5 }, storage);
    expect(t.fileId.startsWith('etc/')).toBe(true);
  });
});
