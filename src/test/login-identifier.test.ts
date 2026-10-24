import { describe, it, expect } from 'vitest';
import { parseIdentifier } from '@/lib/login-identifier';

describe('parseIdentifier', () => {
  it('treats text with @ inside as email', () => expect(parseIdentifier(' a@b.com ')).toEqual({ kind: 'email', value: 'a@b.com' }));
  it('treats plain text as lowercase username', () => expect(parseIdentifier('Boyan')).toEqual({ kind: 'username', value: 'boyan' }));
  it('strips a leading @ from usernames', () => expect(parseIdentifier('@boyan')).toEqual({ kind: 'username', value: 'boyan' }));
});
