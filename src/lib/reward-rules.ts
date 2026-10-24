import { z } from 'zod';
import { binsFor, hasColorGuide } from './bin-guides';
export const itemSchema=z.object({object:z.string().max(150),outcome:z.enum(['correct','incorrect','uncertain']),guidance:z.string().max(500)});
export const binSchema=z.object({color:z.string().max(40),labelText:z.string().max(100),visible:z.boolean()});
export const verificationSchema=z.object({items:z.array(itemSchema).max(100),summary:z.string().max(1000),bin:binSchema.optional(),binMeaning:z.string().max(300).optional()});
export type Verification=z.infer<typeof verificationSchema>;
export function calculatePoints(items:Verification['items']){return items.filter(i=>i.outcome==='correct').length*10;}

const norm=(c:string)=>c.trim().toLowerCase().replace('gray','grey');

/** Decides what the detected bin means in the user's country. Returns null meaning when the bin can't be identified. */
export function resolveBin(country:string,bin:z.infer<typeof binSchema>):{ok:true;meaning:string}|{ok:false;reason:string}{
  if(!bin.visible)return {ok:false,reason:'The bin was not visible in the video, so no points were awarded.'};
  if(bin.labelText.trim())return {ok:true,meaning:`Bin label reads "${bin.labelText.trim()}".`};
  const color=norm(bin.color);
  if(!hasColorGuide(country))return {ok:false,reason:`Bin colors don't have a standard meaning we know for ${country}, and no label was visible. No points were awarded.`};
  const match=binsFor(country).find(b=>norm(b.color)===color||b.label.toLowerCase().includes(color));
  if(!match){const c=color.charAt(0).toUpperCase()+color.slice(1);return {ok:false,reason:`${c} bins aren't a standard bin color in ${country}, so we can't tell what this bin is for. No points were awarded.`};}
  return {ok:true,meaning:match.label};
}

/** Server-side enforcement: an unidentifiable bin can never earn points. */
export function enforceBin(country:string,v:Verification):Verification{
  if(!v.bin)return {...v,items:v.items.map(i=>({...i,outcome:i.outcome==='correct'?'uncertain':i.outcome}))};
  const r=resolveBin(country,v.bin);
  if(r.ok)return {...v,binMeaning:r.meaning};
  return {...v,binMeaning:r.reason,summary:r.reason,items:v.items.map(i=>({...i,outcome:'uncertain' as const,guidance:r.reason}))};
}
