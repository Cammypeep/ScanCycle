import {describe,it,expect} from 'vitest';
import {calculatePoints} from '@/lib/reward-rules';
describe('Recycling rewards',()=>{it('awards 10 points for one correct item',()=>{expect(calculatePoints([{object:'can',outcome:'correct',stream:'recycling',guidance:''}])).toBe(10);});it('awards 10 for each correct item in a multi-item video',()=>{expect(calculatePoints([{object:'can',outcome:'correct',stream:'recycling',guidance:''},{object:'bottle',outcome:'correct',stream:'recycling',guidance:''},{object:'paper',outcome:'correct',stream:'recycling',guidance:''}])).toBe(30);});it('awards zero for wrong-bin items',()=>{expect(calculatePoints([{object:'can',outcome:'incorrect',guidance:'Correct the bin'}])).toBe(0);});it('awards zero for uncertain items',()=>{expect(calculatePoints([{object:'can',outcome:'uncertain',guidance:''}])).toBe(0);});it('awards zero for non-recyclable trash correctly put in the trash bin',()=>{expect(calculatePoints([{object:'snack wrapper',outcome:'correct',stream:'trash',guidance:'Trash bin is right'}])).toBe(0);});});
import {enforceBin} from '@/lib/reward-rules';
describe('Bin color by country',()=>{const item=[{object:'snack wrapper',outcome:'correct' as const,stream:'trash' as const,guidance:''}];
it('grey bin in Australia earns 0',()=>{const v=enforceBin('Australia',{items:item,summary:'',bin:{color:'grey',labelText:'',visible:true}});expect(calculatePoints(v.items)).toBe(0);expect(v.summary).toContain('Australia');});
it('grey bin in US with wrapper earns zero',()=>{expect(calculatePoints(enforceBin('United States',{items:item,summary:'',bin:{color:'gray',labelText:'',visible:true}}).items)).toBe(0);});
it('label overrides color',()=>{expect(calculatePoints(enforceBin('Australia',{items:item,summary:'',bin:{color:'grey',labelText:'General waste',visible:true}}).items)).toBe(0);});
it('invisible bin earns 0',()=>{expect(calculatePoints(enforceBin('United States',{items:item,summary:'',bin:{color:'',labelText:'',visible:false}}).items)).toBe(0);});});

import {binColorFor} from '@/lib/reward-rules';
describe('Non-standard bin color names the right bin',()=>{
it('names the correct bin color and bin for the item',()=>{const v=enforceBin('Australia',{items:[{object:'snack wrapper',outcome:'correct' as const,stream:'trash' as const,guidance:''}],summary:'',bin:{color:'grey',labelText:'',visible:true}});expect(calculatePoints(v.items)).toBe(0);expect(v.items[0]?.guidance).toContain('red general waste bin');expect(v.items[0]?.guidance).toContain('snack wrapper');expect(v.summary).toContain('Use the red general waste bin instead.');});
it('names the recycling bin when the color is not in the US guide',()=>{const v=enforceBin('United States',{items:[{object:'can',outcome:'correct' as const,stream:'recycling' as const,guidance:''}],summary:'',bin:{color:'purple',labelText:'',visible:true}});expect(v.items[0]?.guidance).toContain('blue recycling bin');expect(v.summary).toContain('Use the blue recycling bin instead.');});
it('stays generic for a country without a color guide',()=>{const v=enforceBin('France',{items:[{object:'can',outcome:'correct' as const,stream:'recycling' as const,guidance:''}],summary:'',bin:{color:'grey',labelText:'',visible:true}});expect(v.items[0]?.guidance).toBe("Bin colors don't have a standard meaning we know for France, and no label was visible.");expect(v.summary).not.toContain('Use the');});
it('names the bin color when the bin is not visible',()=>{const v=enforceBin('United States',{items:[{object:'can',outcome:'correct' as const,stream:'recycling' as const,guidance:''}],summary:'',bin:{color:'',labelText:'',visible:false}});expect(v.items[0]?.guidance).toContain('blue recycling bin');});
it('maps paper and glass streams to the mixed recycling bin',()=>{expect(binColorFor('United States','paper')?.color).toBe('blue');expect(binColorFor('Germany','packaging')?.color).toBe('yellow');expect(binColorFor('France','recycling')).toBeNull();});
});

import {tidySummary} from '@/lib/reward-rules';
describe('Result sentence',()=>{
it('drops a "this video shows" preamble',()=>{expect(tidySummary('This video shows a snack wrapper being disposed into the grey trash bin.')).toBe('A snack wrapper being disposed into the grey trash bin.');});
it('leaves a short sentence about the user untouched',()=>{expect(tidySummary('You correctly disposed a non-recyclable snack wrapper into the grey other waste bin.')).toBe('You correctly disposed a non-recyclable snack wrapper into the grey other waste bin.');});
it('trims an overlong sentence',()=>{expect(tidySummary('x'.repeat(200))).toHaveLength(180);});
it('the saved result never opens with the footage preamble',()=>{const v=enforceBin('United States',{items:[{object:'snack wrapper',outcome:'correct' as const,stream:'trash' as const,guidance:''}],summary:'This video shows a wrapper going into the grey trash bin.',bin:{color:'gray',labelText:'',visible:true}});expect(v.summary).toBe('A wrapper going into the grey trash bin.');expect(calculatePoints(v.items)).toBe(0);});
});

 describe('Recycling-only eligibility',()=>{
 it('awards only 10 points for the recyclable in a mixed video',()=>{expect(calculatePoints([{object:'can',outcome:'correct',stream:'recycling',guidance:''},{object:'wrapper',outcome:'correct',stream:'trash',guidance:''}])).toBe(10);});
 it('awards zero when the stream is unknown',()=>{expect(calculatePoints([{object:'item',outcome:'correct',guidance:''}])).toBe(0);});
 it('rejects a recycling claim when the detected bin means trash',()=>{const result=enforceBin('United States',{items:[{object:'wrapper',outcome:'correct',stream:'recycling',guidance:''}],summary:'Correct disposal.',bin:{color:'grey',labelText:'',visible:true}});expect(calculatePoints(result.items)).toBe(0);expect(result.items[0]?.outcome).toBe('correct');});
 it('awards 10 for a correct recyclable in a labeled recycling bin',()=>{expect(calculatePoints(enforceBin('Australia',{items:[{object:'can',outcome:'correct',stream:'recycling',guidance:''}],summary:'',bin:{color:'grey',labelText:'Recycling',visible:true}}).items)).toBe(10);});
 });
import {stripNoPoints} from '@/lib/reward-rules';
it('strips "no points were awarded" from descriptions',()=>{expect(stripNoPoints('The bin was not visible in the video, so no points were awarded.')).toBe('The bin was not visible in the video.');expect(stripNoPoints('Grey bins are odd. No points were awarded. Use the red bin.')).toBe('Grey bins are odd. Use the red bin.');});
