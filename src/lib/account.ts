import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
export const profileSchema = z.object({ full_name: z.string().trim().min(2).max(100), username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/, 'Username needs 3–24 lowercase letters, numbers or underscores.'), country: z.string().trim().min(2).max(80), locality: z.string().trim().max(100) });
export const profileQuery = queryOptions({ queryKey: ['profile'], queryFn: async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return null; const {data,error}=await supabase.from('profiles').select('*').eq('id',user.id).single(); if(error) throw error; return data; } });
export const countries = new Intl.DisplayNames(['en'], {type:'region'});
export const countryOptions = Array.from({length:26*26},(_,i)=>String.fromCharCode(65+Math.floor(i/26),65+i%26)).map(code=>({code,name:countries.of(code)})).filter(x=>x.name && x.name!==x.code && !['EU','UN','XA','XB','ZZ'].includes(x.code)).sort((a,b)=>(a.name??'').localeCompare(b.name??''));
