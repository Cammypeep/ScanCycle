export type Stream = 'recycling' | 'trash' | 'compost' | 'glass' | 'paper' | 'packaging';
export interface Bin { id: string; color: string; stream: Stream; label: string }

const US: Bin[] = [
  { id: 'blue', color: 'blue', stream: 'recycling', label: 'Blue — mixed recycling' },
  { id: 'grey', color: 'grey', stream: 'trash', label: 'Grey — trash / landfill' },
  { id: 'black', color: 'black', stream: 'trash', label: 'Black — trash / landfill' },
  { id: 'green', color: 'green', stream: 'compost', label: 'Green — compost / yard waste' },
];

const GUIDES: Record<string, Bin[]> = {
  'United States': US,
  Canada: [
    { id: 'blue', color: 'blue', stream: 'recycling', label: 'Blue — recycling' },
    { id: 'green', color: 'green', stream: 'compost', label: 'Green — organics' },
    { id: 'black', color: 'black', stream: 'trash', label: 'Black / grey — garbage' },
  ],
  'United Kingdom': [
    { id: 'blue', color: 'blue', stream: 'recycling', label: 'Blue — mixed recycling' },
    { id: 'green', color: 'green', stream: 'recycling', label: 'Green — recycling or garden waste' },
    { id: 'black', color: 'black', stream: 'trash', label: 'Black / grey — general waste' },
    { id: 'brown', color: 'brown', stream: 'compost', label: 'Brown — food / garden waste' },
  ],
  Germany: [
    { id: 'yellow', color: 'yellow', stream: 'packaging', label: 'Yellow — plastic & metal packaging' },
    { id: 'blue', color: 'blue', stream: 'paper', label: 'Blue — paper & cardboard' },
    { id: 'brown', color: 'brown', stream: 'compost', label: 'Brown — organic waste' },
    { id: 'black', color: 'black', stream: 'trash', label: 'Black / grey — residual waste' },
  ],
  Australia: [
    { id: 'yellow', color: 'yellow', stream: 'recycling', label: 'Yellow lid — recycling' },
    { id: 'red', color: 'red', stream: 'trash', label: 'Red lid — general waste' },
    { id: 'green', color: 'green', stream: 'compost', label: 'Green lid — garden / food' },
  ],
  India: [
    { id: 'blue', color: 'blue', stream: 'recycling', label: 'Blue — dry waste' },
    { id: 'green', color: 'green', stream: 'compost', label: 'Green — wet waste' },
  ],
  China: [
    { id: 'blue', color: 'blue', stream: 'recycling', label: 'Blue — recyclables' },
    { id: 'green', color: 'green', stream: 'compost', label: 'Green — food waste' },
    { id: 'grey', color: 'grey', stream: 'trash', label: 'Grey / black — other waste' },
    { id: 'red', color: 'red', stream: 'trash', label: 'Red — hazardous waste' },
  ],
};

const GENERIC: Bin[] = [
  { id: 'recycling', color: 'any', stream: 'recycling', label: 'Recycling bin' },
  { id: 'trash', color: 'any', stream: 'trash', label: 'Trash / general waste bin' },
  { id: 'compost', color: 'any', stream: 'compost', label: 'Compost / organics bin' },
];

export function binsFor(country?: string | null): Bin[] {
  return (country && GUIDES[country]) || GENERIC;
}
