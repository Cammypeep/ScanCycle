import {describe,it,expect} from 'vitest';
import {itemImpact,kmEquivalent} from '@/lib/impact';
const base={outcome:'correct' as const,stream:'recycling' as const,guidance:''};
describe('Impact',()=>{
  it('regular plastic bottle saves 50 g and makes 1 bottle',()=>{expect(itemImpact({...base,object:'water bottle',material:'plastic',size:'regular',quantity:1})).toEqual({co2Grams:50,remade:{kind:'bottles',count:1}});});
  it('3 cans save 420 g and make 3 cans',()=>{expect(itemImpact({...base,object:'can',material:'metal',size:'regular',quantity:3})).toEqual({co2Grams:420,remade:{kind:'cans',count:3}});});
  it('trash saves nothing',()=>{expect(itemImpact({...base,stream:'trash',object:'wrapper',material:'plastic',size:'small',quantity:1}).co2Grams).toBe(0);});
  it('1 kg is about 5.9 km',()=>{expect(kmEquivalent(1000)).toBe(5.9);});
});
