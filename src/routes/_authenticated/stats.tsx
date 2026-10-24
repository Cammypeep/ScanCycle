import {createFileRoute} from '@tanstack/react-router';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {Bar,BarChart,CartesianGrid,XAxis,YAxis,Tooltip,ResponsiveContainer} from 'recharts';
import {supabase} from '@/integrations/supabase/client';
import {Button} from '@/components/ui/button';
import {profileQuery} from '@/lib/account';

export const Route=createFileRoute('/_authenticated/stats')({head:()=>({meta:[{title:'My Recycling Graph — ScrapSense'},{name:'description',content:'See how much you recycled this week, month and year.'},{property:'og:title',content:'My Recycling Graph — ScrapSense'},{property:'og:description',content:'Your recycling over time.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:Stats});

type Range='week'|'month'|'year'|'all';
const day=(d:Date)=>d.toISOString().slice(0,10);

function buckets(range:Range,rows:{created_at:string;correct_items:number;points:number|null}[]){
  const now=new Date();
  const out:{label:string;key:string;items:number}[]=[];
  if(range==='week'||range==='month'){
    const n=range==='week'?7:30;
    for(let i=n-1;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);out.push({key:day(d),label:d.toLocaleDateString(undefined,range==='week'?{weekday:'short'}:{month:'short',day:'numeric'}),items:0});}
    rows.forEach(r=>{const b=out.find(o=>o.key===day(new Date(r.created_at)));if(b)b.items+=(r.points??0)/10;});
  }else{
    const months=range==='year'?12:Math.max(1,(()=>{const f=rows.length?new Date(rows[rows.length-1].created_at):now;return (now.getFullYear()-f.getFullYear())*12+now.getMonth()-f.getMonth()+1;})());
    for(let i=months-1;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);out.push({key:d.getFullYear()+'-'+d.getMonth(),label:d.toLocaleDateString(undefined,{month:'short',year:months>12?'2-digit':undefined}),items:0});}
    rows.forEach(r=>{const d=new Date(r.created_at);const b=out.find(o=>o.key===d.getFullYear()+'-'+d.getMonth());if(b)b.items+=(r.points??0)/10;});
  }
  return out;
}

function Stats(){
  const {data:profile}=useQuery(profileQuery);
  const [range,setRange]=useState<Range>('week');
  const q=useQuery({queryKey:['my-submissions',profile?.id],enabled:!!profile,queryFn:async()=>{const {data,error}=await supabase.from('video_submissions').select('created_at,correct_items,points').eq('user_id',profile!.id).order('created_at',{ascending:false});if(error)throw error;return data;}});
  const data=buckets(range,q.data??[]);
  const total=data.reduce((s,b)=>s+b.items,0);
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <p className="font-mono text-xs uppercase text-primary">Your progress</p>
      <h1 className="mt-2 text-3xl font-bold">Recycling graph</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {(['week','month','year','all'] as Range[]).map(r=><Button key={r} variant={range===r?'default':'outline'} onClick={()=>setRange(r)}>{r==='week'?'This week':r==='month'?'This month':r==='year'?'This year':'All time'}</Button>)}
      </div>
      <p className="mt-6 text-lg"><span className="text-3xl font-bold text-primary">{total}</span> items recycled · {total*10} points</p>
      {q.error&&<p className="mt-4 text-warning">Could not load your recycling history.</p>}
      <div className="mt-6 h-72 rounded-xl border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={12} interval="preserveStartEnd"/>
            <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} width={30}/>
            <Tooltip cursor={{fill:'var(--secondary)'}} contentStyle={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8}} formatter={(v)=>[v,'Items recycled']}/>
            <Bar dataKey="items" fill="var(--primary)" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Counts items you recycled correctly in verified videos.</p>
    </section>
  );
}
