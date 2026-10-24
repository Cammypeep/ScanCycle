import {describe, expect, it} from 'vitest';
import {videoSubmissionKey} from '@/lib/video-submission-key';

describe('Temporary repeat video testing', () => {
  const bytes = new TextEncoder().encode('same uploaded video').buffer;
  it('allows the same video more than once with distinct submission keys by default', async () => {
    const first = await videoSubmissionKey(bytes);
    const second = await videoSubmissionKey(bytes);
    expect(first).not.toBe(second);
    expect(first.split(':')[0]).toBe(second.split(':')[0]);
  });
  it('restores duplicate detection when testing is disabled', async () => {
    const first = await videoSubmissionKey(bytes, false);
    expect(first).toBe(await videoSubmissionKey(bytes, false));
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });
});