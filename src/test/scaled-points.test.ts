import {describe,it,expect} from 'vitest';
import {itemPoints,calculatePoints,cooldownRemaining} from '@/lib/reward-rules';
const base={outcome:'correct' as const,stream:'recycling' as const,guidance:''};
describe('Scaled points',()=>{
  it('one sheet of paper is 0.1',()=>{expect(itemPoints({...base,object:'sheet of paper',material:'paper',size:'small',quantity:1})).toBe(0.1);});
  it('five sheets of paper is 0.5',()=>{expect(itemPoints({...base,object:'sheet of paper',material:'paper',size:'small',quantity:5})).toBe(0.5);});
  it('regular water bottle is 10',()=>{expect(itemPoints({...base,object:'plastic water bottle',material:'plastic',size:'regular',quantity:1})).toBe(10);});
  it('trash earns 0',()=>{expect(itemPoints({...base,stream:'trash',object:'wrapper',material:'plastic',size:'small',quantity:3})).toBe(0);});
  it('submission capped at 200',()=>{expect(calculatePoints([{...base,object:'can',material:'metal',size:'regular',quantity:100}])).toBe(200);});
});
describe('Cooldown',()=>{
  const t=Date.parse('2026-10-24T12:00:00Z');
  it('blocks at 9 minutes',()=>{expect(cooldownRemaining('2026-10-24T12:00:00Z',t+9*60000,true)).toBe(60000);});
  it('allows at 10 minutes',()=>{expect(cooldownRemaining('2026-10-24T12:00:00Z',t+10*60000,true)).toBe(0);});
});
