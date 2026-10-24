import {describe,it,expect} from 'vitest';
import {itemImpact,kmEquivalent} from '@/lib/impact';
const base={outcome:'correct' as const,stream:'recycling' as const,guidance:''};
describe('Impact with real recycling rates',()=>{
  it('US regular bottle saves 15 g and makes 0.3 bottles',()=>{expect(itemImpact({...base,object:'water bottle',material:'plastic',size:'regular',quantity:1},'United States')).toEqual({co2Grams:15,remade:{kind:'bottles',count:0.3}});});
  it('Germany 3 cans save 378 g and make 2.7 cans',()=>{expect(itemImpact({...base,object:'can',material:'metal',size:'regular',quantity:3},'Germany')).toEqual({co2Grams:378,remade:{kind:'cans',count:2.7}});});
  it('unknown country uses default rates',()=>{expect(itemImpact({...base,object:'can',material:'metal',size:'regular',quantity:1},'France').co2Grams).toBe(84);});
  it('trash saves nothing',()=>{expect(itemImpact({...base,stream:'trash',object:'wrapper',material:'plastic',size:'small',quantity:1},'Germany').co2Grams).toBe(0);});
  it('1 kg is about 5.9 km',()=>{expect(kmEquivalent(1000)).toBe(5.9);});
});
