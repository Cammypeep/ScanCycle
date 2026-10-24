import {describe,it,expect} from 'vitest';
import {materialOf} from '@/lib/reward-rules';
describe('Item material',()=>{
  it('uses the AI material when present',()=>{expect(materialOf({object:'bottle',material:'glass'})).toBe('glass');});
  it('guesses metal for an aluminum can',()=>{expect(materialOf({object:'aluminum can'})).toBe('metal');});
  it('guesses plastic for a water bottle',()=>{expect(materialOf({object:'water bottle'})).toBe('plastic');});
  it('falls back to other',()=>{expect(materialOf({object:'mystery thing'})).toBe('other');});
});
