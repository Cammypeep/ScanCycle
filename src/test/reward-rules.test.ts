import {describe,it,expect} from 'vitest';
import {calculatePoints} from '@/lib/reward-rules';
describe('Recycling rewards',()=>{it('awards 10 points for one correct item',()=>{expect(calculatePoints([{object:'can',outcome:'correct',guidance:''}])).toBe(10);});it('awards 10 for each correct item in a multi-item video',()=>{expect(calculatePoints([{object:'can',outcome:'correct',guidance:''},{object:'bottle',outcome:'correct',guidance:''},{object:'paper',outcome:'correct',guidance:''}])).toBe(30);});it('awards zero for wrong-bin items',()=>{expect(calculatePoints([{object:'can',outcome:'incorrect',guidance:'Correct the bin'}])).toBe(0);});it('awards zero for uncertain items',()=>{expect(calculatePoints([{object:'can',outcome:'uncertain',guidance:''}])).toBe(0);});it('awards 10 for non-recyclable trash correctly put in the trash bin',()=>{expect(calculatePoints([{object:'snack wrapper',outcome:'correct',guidance:'Trash bin is right'}])).toBe(10);});});
import {enforceBin} from '@/lib/reward-rules';
describe('Bin color by country',()=>{const item=[{object:'snack wrapper',outcome:'correct' as const,guidance:''}];
it('grey bin in Australia earns 0',()=>{const v=enforceBin('Australia',{items:item,summary:'',bin:{color:'grey',labelText:'',visible:true}});expect(calculatePoints(v.items)).toBe(0);expect(v.summary).toContain('Australia');});
it('grey bin in US with wrapper earns 10',()=>{expect(calculatePoints(enforceBin('United States',{items:item,summary:'',bin:{color:'gray',labelText:'',visible:true}}).items)).toBe(10);});
it('label overrides color',()=>{expect(calculatePoints(enforceBin('Australia',{items:item,summary:'',bin:{color:'grey',labelText:'General waste',visible:true}}).items)).toBe(10);});
it('invisible bin earns 0',()=>{expect(calculatePoints(enforceBin('United States',{items:item,summary:'',bin:{color:'',labelText:'',visible:false}}).items)).toBe(0);});});

import {tidySummary} from '@/lib/reward-rules';
describe('Result sentence',()=>{
it('drops a "this video shows" preamble',()=>{expect(tidySummary('This video shows a snack wrapper being disposed into the grey trash bin.')).toBe('A snack wrapper being disposed into the grey trash bin.');});
it('leaves a short sentence about the user untouched',()=>{expect(tidySummary('You correctly disposed a non-recyclable snack wrapper into the grey other waste bin.')).toBe('You correctly disposed a non-recyclable snack wrapper into the grey other waste bin.');});
it('trims an overlong sentence',()=>{expect(tidySummary('x'.repeat(200))).toHaveLength(180);});
it('the saved result never opens with the footage preamble',()=>{const v=enforceBin('United States',{items:[{object:'snack wrapper',outcome:'correct' as const,guidance:''}],summary:'This video shows a wrapper going into the grey trash bin.',bin:{color:'gray',labelText:'',visible:true}});expect(v.summary).toBe('A wrapper going into the grey trash bin.');expect(calculatePoints(v.items)).toBe(10);});
});
