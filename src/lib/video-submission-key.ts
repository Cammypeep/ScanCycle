// Temporary testing switch: set to false to restore content-based duplicate blocking.
export const ALLOW_REPEAT_VIDEO_SUBMISSIONS = true;

export async function videoSubmissionKey(bytes: ArrayBuffer, allowRepeats = ALLOW_REPEAT_VIDEO_SUBMISSIONS) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  return allowRepeats ? `${hash}:${crypto.randomUUID()}` : hash;
}