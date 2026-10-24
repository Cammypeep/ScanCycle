import { z } from 'zod';
import { binsFor, hasColorGuide } from './bin-guides';
export const itemSchema=z.object({object:z.string().max(150),outcome:z.enum(['correct','incorrect','uncertain']),stream:z.enum(['recycling','trash','compost','glass','paper','packaging']).optional(),material:z.enum(['plastic','paper','cardboard','metal','glass','other']).optional(),guidance:z.string().max(500)});
export const binSchema=z.object({color:z.string().max(40),labelText:z.string().max(100),visible:z.boolean()});
export const verificationSchema=z.object({items:z.array(itemSchema).max(100),summary:z.string().max(1000),bin:binSchema.optional(),binMeaning:z.string().max(300).optional()});
export type Verification=z.infer<typeof verificationSchema>;
export const MATERIALS=['plastic','paper','cardboard','metal','glass','other'] as const;
export type Material=typeof MATERIALS[number];
/** Item material from the AI, or a keyword guess for older results. */
export function materialOf(item:{object:string;material?:Material|undefined}):Material{
  if(item.material)return item.material;
  const o=item.object.toLowerCase();
  if(/cardboard|carton|box/.test(o))return 'cardboard';
  if(/\bcans?\b|alumin|tin|steel|metal|foil/.test(o))return 'metal';
  if(/glass|jar/.test(o))return 'glass';
  if(/paper|newspaper|magazine|envelope|receipt/.test(o))return 'paper';
  if(/plastic|bottle|jug|tub|cup|container/.test(o))return 'plastic';
  return 'other';
}
export function itemPoints(item:Verification['items'][number]){return item.outcome==='correct'&&['recycling','glass','paper','packaging'].includes(item.stream??'')?10:0;}
export function calculatePoints(items:Verification['items']){return items.reduce((total,item)=>total+itemPoints(item),0);}

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

const streamWord=(s:'recycling'|'trash'|'compost'|'glass'|'paper'|'packaging')=>s==='trash'?'general waste':s;

/** The bin color in the country's guide that an item of this stream belongs in. Null when the country has no color guide or no bin covers the stream. */
export function binColorFor(country:string,stream?:'recycling'|'trash'|'compost'|'glass'|'paper'|'packaging'):{color:string;label:string;stream:'recycling'|'trash'|'compost'|'glass'|'paper'|'packaging'}|null{
  if(!stream||!hasColorGuide(country))return null;
  const guide=binsFor(country);
  const b=guide.find(x=>x.stream===stream)||(['glass','paper','packaging'].includes(stream)?guide.find(x=>x.stream==='recycling'):undefined);
  return b?{color:b.color,label:b.label,stream:b.stream}:null;
}

/** Sentences that talk about the footage instead of the user, e.g. "This video shows ...". */
const PREAMBLE=/^(?:this\s+(?:video|clip|footage|recording)\s+(?:shows|showed|contains|contained|depicts|features|captures|is\s+of|of)\s*[:;,]?\s*)+/i;

/** Keeps the result sentence about the user and short: strips footage preambles and trims overlong text. */
export function tidySummary(s:string):string{
  const t=s.replace(PREAMBLE,'').replace(/\s+/g,' ').trim();
  if(!t)return s.trim();
  const out=t.charAt(0).toUpperCase()+t.slice(1);
  return out.length>180?out.slice(0,179).replace(/\s+\S*$/,'')+'.':out;
}

/** Server-side enforcement: an unidentifiable bin can never earn points. */
export function enforceBin(country:string,v:Verification):Verification{
  if(!v.bin)return {...v,summary:tidySummary(v.summary),items:v.items.map(i=>({...i,outcome:i.outcome==='correct'?'uncertain':i.outcome}))};
  const r=resolveBin(country,v.bin);
  if(r.ok){
    const label=v.bin.labelText.trim();
    const trashBin=label?/\b(trash|garbage|landfill|general waste|other waste|residual waste|rubbish)\b/i.test(label):binsFor(country).find(b=>norm(b.color)===norm(v.bin?.color??'')||b.label.toLowerCase().includes(norm(v.bin?.color??'')))?.stream==='trash';
    return {...v,binMeaning:r.meaning,summary:tidySummary(v.summary),items:v.items.map(i=>{
      const item=trashBin?{...i,stream:'trash' as const}:i;
      return item.outcome==='correct'&&itemPoints(item)===0?{...item,guidance:'Correct disposal, but no points: rewards are only for items recycled into the correct recycling bin.'}:item;
    })};
  }
  const hints=v.items.map(i=>binColorFor(country,i.stream));
  const unique=new Set(hints.filter(b=>b).map(b=>`${b!.color} ${streamWord(b!.stream)}`));
  const summary=hints.some(b=>b)&&unique.size===1?`${r.reason} Use the ${[...unique][0]} bin instead.`:r.reason;
  return {...v,binMeaning:summary,summary:tidySummary(summary),items:v.items.map((i,n)=>{
    const b=hints[n];
    return b?{...i,outcome:'uncertain' as const,guidance:`${r.reason} For ${i.object}, use the ${b.color} ${streamWord(b.stream)} bin.`}:{...i,outcome:'uncertain' as const,guidance:r.reason};
  })};
}
