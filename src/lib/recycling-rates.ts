import type {Material} from './reward-rules';
type Rates=Record<Exclude<Material,'other'>,number>;
/** Estimated real recycling rates: share of collected items actually remade. */
export const RATES:Record<string,Rates>={
  'United States':{plastic:0.30,paper:0.65,cardboard:0.70,metal:0.50,glass:0.31},
  Canada:{plastic:0.25,paper:0.65,cardboard:0.70,metal:0.60,glass:0.45},
  'United Kingdom':{plastic:0.45,paper:0.70,cardboard:0.75,metal:0.75,glass:0.72},
  Germany:{plastic:0.50,paper:0.80,cardboard:0.85,metal:0.90,glass:0.80},
  Australia:{plastic:0.18,paper:0.60,cardboard:0.65,metal:0.65,glass:0.57},
  India:{plastic:0.35,paper:0.40,cardboard:0.45,metal:0.60,glass:0.45},
  China:{plastic:0.30,paper:0.50,cardboard:0.55,metal:0.70,glass:0.40},
};
export const DEFAULT_RATES:Rates={plastic:0.25,paper:0.55,cardboard:0.60,metal:0.60,glass:0.45};
export const ratesFor=(country?:string|null)=>(country&&RATES[country])||DEFAULT_RATES;
export function rateFor(country:string|null|undefined,m:Material){const r=ratesFor(country);return m==='other'?r.plastic/2:r[m];}
