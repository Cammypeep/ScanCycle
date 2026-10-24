export type LoginIdentifier = { kind: 'email'; value: string } | { kind: 'username'; value: string };

export function parseIdentifier(raw: string): LoginIdentifier {
  const v = raw.trim();
  if (v.includes('@') && !v.startsWith('@')) return { kind: 'email', value: v };
  return { kind: 'username', value: v.replace(/^@+/, '').toLowerCase() };
}
