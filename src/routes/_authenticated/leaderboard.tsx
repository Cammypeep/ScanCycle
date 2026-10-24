import {createFileRoute} from '@tanstack/react-router';
import {useQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {Trophy,Globe,MapPin} from 'lucide-react';
import {supabase} from '@/integrations/supabase/client';
import {Button} from '@/components/ui/button';
import {profileQuery} from '@/lib/account';

export const Route=createFileRoute('/_authenticated/leaderboard')({head:()=>({meta:[{title:'Leaderboard — ScrapSense'},{name:'description',content:'See the top recyclers in your country and worldwide.'},{property:'og:title',content:'Leaderboard — ScrapSense'},{property:'og:description',content:'Top recyclers by country and worldwide.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:Leaderboard});

function Leaderboard(){
  const {data:profile}=useQuery(profileQuery);
  const [scope,setScope]=useState<'country'|'world'>('country');
  const country=scope==='country'?profile?.country:undefined;
  const board=useQuery({queryKey:['leaderboard',scope,country],enabled:!!profile,queryFn:async()=>{const {data,error}=await supabase.rpc('leaderboard',country?{_country:country}:{});if(error)throw error;return data;},refetchInterval:30000});
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <p className="font-mono text-xs uppercase text-primary">Top recyclers</p>
      <h1 className="mt-2 text-3xl font-bold">Leaderboard</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant={scope==='country'?'default':'outline'} onClick={()=>setScope('country')}><MapPin/>{profile?.country||'My country'}</Button>
        <Button variant={scope==='world'?'default':'outline'} onClick={()=>setScope('world')}><Globe/>Worldwide</Button>
      </div>
      {board.error&&<p className="mt-4 text-warning">Could not load the leaderboard.</p>}
      <ol className="mt-6 divide-y divide-border">
        {board.data?.length===0&&<p className="py-8 text-muted-foreground">No recyclers here yet.</p>}
        {board.data?.map((r,n)=>(
          <li key={r.id} className={'flex items-center gap-4 py-4 '+(r.id===profile?.id?'rounded-lg bg-secondary px-3':'')}>
            <span className={'w-8 text-center font-mono text-lg font-bold '+(n<3?'text-warning':'text-muted-foreground')}>{n+1}</span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold">{r.full_name||r.username}{r.id===profile?.id&&' (you)'}</h2>
              <p className="text-xs text-muted-foreground">@{r.username}{scope==='world'&&r.country?' · '+r.country:''}</p>
            </div>
            <span className="flex items-center gap-2 text-warning"><Trophy className="h-4 w-4"/>{r.points}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
