import {createFileRoute} from '@tanstack/react-router';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {Bar,BarChart,CartesianGrid,XAxis,YAxis,Tooltip,ResponsiveContainer,Legend} from 'recharts';
import {itemImpact,formatCo2,kmEquivalent,REMADE_LABEL,type RemadeKind} from '@/lib/impact';
import {RATES,ratesFor} from '@/lib/recycling-rates';
import {Leaf,Recycle} from 'lucide-react';
import {supabase} from '@/integrations/supabase/client';
import {Button} from '@/components/ui/button';
import {profileQuery} from '@/lib/account';
import {MATERIALS,materialOf,itemPoints,formatPoints,verificationSchema,type Material} from '@/lib/reward-rules';

export const Route=createFileRoute('/_authenticated/stats')({head:()=>({meta:[{title:'My Recycling Graph — ScanCycle'},{name:'description',content:'See how much plastic, paper, metal and glass you recycled this week, month and year.'},{property:'og:title',content:'My Recycling Graph — ScanCycle'},{property:'og:description',content:'Your recycling over time, by material.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:Stats});

type Range='week'|'month'|'year'|'all';
type Row={created_at:string;result:unknown;points_awarded?:number|null};
const NAMES:Record<Material,string>={plastic:'Plastic',paper:'Paper',cardboard:'Cardboard',metal:'Metal',glass:'Glass',other:'Other'};
const COLORS:Record<Material,string>={plastic:'var(--chart-2)',paper:'var(--chart-3)',cardboard:'var(--chart-4)',metal:'var(--chart-5)',glass:'var(--chart-1)',other:'var(--muted-foreground)'};
const day=(d:Date)=>d.toISOString().slice(0,10);
const inRange=(range:Range,iso:string)=>{const d=new Date(iso),n=new Date();if(range==='all')return true;if(range==='year')return d>=new Date(n.getFullYear(),n.getMonth()-11,1);const s=new Date(n);s.setDate(n.getDate()-(range==='week'?6:29));s.setHours(0,0,0,0);return d>=s;};
type Bucket={label:string;key:string;co2:number}&Record<Material,number>;
const empty=()=>Object.fromEntries(MATERIALS.map(m=>[m,0])) as Record<Material,number>;
const emptyB=()=>({...empty(),co2:0});
function impactOf(r:Row,country?:string|null){const p=verificationSchema.safeParse(r.result);return p.success?p.data.items.map(i=>itemImpact(i,country)):[];}

function itemsOf(r:Row){const p=verificationSchema.safeParse(r.result);return p.success?p.data.items.filter(i=>itemPoints(i)>0).flatMap(i=>Array(i.quantity??1).fill(materialOf(i)) as Material[]):[];}

function buckets(range:Range,rows:Row[],country?:string|null){
  const now=new Date();const out:Bucket[]=[];let keyOf:(d:Date)=>string;
  if(range==='week'||range==='month'){
    const n=range==='week'?7:30;keyOf=day;
    for(let i=n-1;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);out.push({key:day(d),label:d.toLocaleDateString(undefined,range==='week'?{weekday:'short'}:{month:'short',day:'numeric'}),...emptyB()});}
  }else{
    const last=rows[rows.length-1];const f=last?new Date(last.created_at):now;
    const months=range==='year'?12:Math.max(1,(now.getFullYear()-f.getFullYear())*12+now.getMonth()-f.getMonth()+1);
    keyOf=d=>d.getFullYear()+'-'+d.getMonth();
    for(let i=months-1;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);out.push({key:keyOf(d),label:d.toLocaleDateString(undefined,{month:'short',year:months>12?'2-digit':undefined}),...emptyB()});}
  }
  rows.forEach(r=>{const b=out.find(o=>o.key===keyOf(new Date(r.created_at)));if(b){itemsOf(r).forEach(m=>{b[m]+=1;});impactOf(r,country).forEach(i=>{b.co2+=i.co2Grams;});}});
  return out;
}

function Stats(){
  const {data:profile}=useQuery(profileQuery);
  const [range,setRange]=useState<Range>('week');
  const [mat,setMat]=useState<Material|'all'>('all');
  const q=useQuery({queryKey:['my-submissions',profile?.id],enabled:!!profile,queryFn:async()=>{const {data,error}=await supabase.from('video_submissions').select('created_at,result,points_awarded').eq('user_id',profile!.id).order('created_at',{ascending:false});if(error)throw error;return data;}});
  const data=buckets(range,q.data??[],profile?.country);
  const totals=empty();data.forEach(b=>MATERIALS.forEach(m=>{totals[m]+=b[m];}));
  const shown=mat==='all'?MATERIALS.filter(m=>totals[m]>0):[mat];
  const points=Math.round((q.data??[]).filter(r=>inRange(range,r.created_at)).reduce((s,r)=>s+Number(r.points_awarded??0),0)*10)/10;
  const co2=data.reduce((s,b)=>s+b.co2,0);
  const remade:Partial<Record<RemadeKind,number>>={};
  (q.data??[]).filter(r=>inRange(range,r.created_at)).forEach(r=>impactOf(r,profile?.country).forEach(i=>{if(i.remade)remade[i.remade.kind]=(remade[i.remade.kind]??0)+i.remade.count;}));
  const total=mat==='all'?MATERIALS.reduce((s,m)=>s+totals[m],0):totals[mat];
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <p className="font-mono text-xs uppercase text-primary">Your progress</p>
      <h1 className="mt-2 text-3xl font-bold">Recycling graph</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {(['week','month','year','all'] as Range[]).map(r=><Button key={r} variant={range===r?'default':'outline'} onClick={()=>setRange(r)}>{r==='week'?'This week':r==='month'?'This month':r==='year'?'This year':'All time'}</Button>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(['all',...MATERIALS] as const).map(m=><Button key={m} size="sm" variant={mat===m?'secondary':'ghost'} onClick={()=>setMat(m)}>{m!=='all'&&<span className="h-2.5 w-2.5 rounded-full" style={{background:COLORS[m]}}/>}{m==='all'?'All':NAMES[m]}</Button>)}
      </div>
      <p className="mt-6 text-lg"><span className="text-3xl font-bold text-primary">{total}</span> {mat==='all'?'items':NAMES[mat].toLowerCase()+' items'} recycled · {formatPoints(points)} points</p>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {MATERIALS.map(m=><div key={m} className="rounded-lg border border-border bg-card p-3 text-center"><p className="text-xs text-muted-foreground">{NAMES[m]}</p><p className="text-xl font-bold" style={{color:COLORS[m]}}>{totals[m]}</p></div>)}
      </div>
      {q.error&&<p className="mt-4 text-warning">Could not load your recycling history.</p>}
      <div className="mt-6 h-72 rounded-xl border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} interval="preserveStartEnd"/>
            <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} width={30}/>
            <Tooltip cursor={{fill:'var(--secondary)'}} contentStyle={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8}}/>
            {shown.length>1&&<Legend/>}
            {shown.map((m,i)=><Bar key={m} dataKey={m} name={NAMES[m]} stackId="a" fill={COLORS[m]} radius={i===shown.length-1?[4,4,0,0]:0}/>)}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <h2 className="mt-10 text-2xl font-bold">Your impact</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Leaf className="h-4 w-4 text-primary"/>CO2 saved</p>
          <p className="mt-2 text-3xl font-bold text-primary">{formatCo2(co2)}</p>
          <p className="mt-1 text-sm text-muted-foreground">kept out of the air · about {kmEquivalent(co2)} km not driven by car</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Recycle className="h-4 w-4 text-primary"/>Remade because of you</p>
          {Object.keys(remade).length?<ul className="mt-2 space-y-1">{(Object.entries(remade) as [RemadeKind,number][]).map(([k,n])=><li key={k}><span className="text-xl font-bold text-foreground">{n.toFixed(1)}</span> <span className="text-muted-foreground">{REMADE_LABEL[k]}</span></li>)}</ul>:<p className="mt-2 text-muted-foreground">Recycle items to see what they become.</p>}
        </div>
      </div>
      <div className="mt-4 h-56 rounded-xl border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.map(b=>({label:b.label,co2:Math.round(b.co2)}))}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} interval="preserveStartEnd"/>
            <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} width={40} unit="g"/>
            <Tooltip cursor={{fill:'var(--secondary)'}} formatter={(v)=>[`${v} g`,'CO2 saved']} contentStyle={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8}}/>
            <Bar dataKey="co2" name="CO2 saved" fill="var(--primary)" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Based on real recycling rates in {profile?.country&&RATES[profile.country]?profile.country:'your region (typical estimate)'}: {(['plastic','paper','metal','glass','cardboard'] as const).map(m=>`${m} ${Math.round(ratesFor(profile?.country)[m]*100)}%`).join(', ')}. Only that share of what you recycle actually gets remade.</p>
      <p className="mt-1 text-xs text-muted-foreground">Impact numbers are typical estimates per item, not exact measurements.</p>
      <p className="mt-3 text-xs text-muted-foreground">Counts items you recycled correctly in verified videos. Older videos have their material guessed from the item name.</p>
    </section>
  );
}
