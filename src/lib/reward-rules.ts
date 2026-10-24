import { z } from 'zod';
export const itemSchema=z.object({object:z.string().max(150),outcome:z.enum(['correct','incorrect','uncertain']),guidance:z.string().max(500)});
export const verificationSchema=z.object({items:z.array(itemSchema).max(100),summary:z.string().max(1000)});
export type Verification=z.infer<typeof verificationSchema>;
export function calculatePoints(items:Verification['items']){return items.filter(i=>i.outcome==='correct').length*10;}
