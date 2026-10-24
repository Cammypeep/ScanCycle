import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

const input = z.object({ username: z.string().regex(/^[a-z0-9_]{3,24}$/), password: z.string().min(8).max(128) });
const GENERIC = 'Invalid login details';

export const signInWithUsername = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: profile } = await supabaseAdmin.from('profiles').select('id').eq('username', data.username).maybeSingle();
    if (!profile) return { error: GENERIC } as const;
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(profile.id);
    const email = u?.user?.email;
    if (!email) return { error: GENERIC } as const;
    const { createClient } = await import('@supabase/supabase-js');
    const key = process.env['SUPABASE_PUBLISHABLE_KEY']!;
    const client = createClient(process.env['SUPABASE_URL']!, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: { fetch: (i, init) => { const h = new Headers(init?.headers); if (key.startsWith('sb_') && h.get('Authorization') === `Bearer ${key}`) h.delete('Authorization'); h.set('apikey', key); return fetch(i, { ...init, headers: h }); } },
    });
    const { data: s, error } = await client.auth.signInWithPassword({ email, password: data.password });
    if (error || !s.session) return { error: GENERIC } as const;
    return { access_token: s.session.access_token, refresh_token: s.session.refresh_token } as const;
  });
