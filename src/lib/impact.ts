import {rateFor} from './recycling-rates';
import {itemPoints,materialOf,type Material,type Verification} from './reward-rules';
type Item=Verification['items'][number];
type Size='small'|'regular'|'large';
/** Typical grams of CO2 saved by recycling one item, by material and size. */
export const CO2_TABLE:Record<Material,Record<Size,number>>={
  plastic:{small:20,regular:50,large:100},
  metal:{small:50,regular:140,large:200},
  glass:{small:100,regular:200,large:300},
  paper:{small:5,regular:30,large:60},
  cardboard:{small:60,regular:150,large:300},
  other:{small:10,regular:30,large:60},
};
export type RemadeKind='bottles'|'cans'|'jars'|'sheets'|'boxes';
const REMADE:Record<Material,RemadeKind|null>={plastic:'bottles',metal:'cans',glass:'jars',paper:'sheets',cardboard:'boxes',other:null};
export const REMADE_LABEL:Record<RemadeKind,string>={bottles:'new plastic bottles',cans:'new cans',jars:'new glass bottles/jars',sheets:'new sheets of paper',boxes:'new boxes'};
export const KG_CO2_PER_KM=0.17;
export function itemImpact(item:Item,country?:string|null):{co2Grams:number;remade:{kind:RemadeKind;count:number}|null}{
  if(itemPoints(item)<=0)return {co2Grams:0,remade:null};
  const m=materialOf(item);const q=item.quantity??1;const size=item.size??'regular';
  const kind=REMADE[m];
  const per=m==='paper'&&/newspaper|magazine/i.test(item.object)?8:1;
  const r=rateFor(country,m);const r1=(n:number)=>Math.round(n*1000)/1000;
  return {co2Grams:r1(CO2_TABLE[m][size]*q*r),remade:kind?{kind,count:r1(q*per*r)}:null};
}
export const formatCo2=(g:number)=>g>=1000?`${(g/1000).toFixed(1)} kg`:`${Math.round(g)} g`;
export const kmEquivalent=(g:number)=>Math.round(g/1000/KG_CO2_PER_KM*10)/10;
