import {createFileRoute} from '@tanstack/react-router';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useServerFn} from '@tanstack/react-start';
import {useEffect,useRef,useState} from 'react';
import {Trophy,Upload,CheckCircle2,AlertTriangle,Video,Target} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {supabase} from '@/integrations/supabase/client';
import {profileQuery} from '@/lib/account';
import {verifyVideo} from '@/lib/rewards.functions';
import {verificationSchema,itemPoints,type Verification} from '@/lib/reward-rules';
import {BIN_SWATCH} from '@/lib/scan-types';

export const Route=createFileRoute('/_authenticated/rewards')({head:()=>({meta:[{title:'Recycling rewards — ScrapSense'},{name:'description',content:'Earn 10 points per correctly recycled item with video verification.'},{property:'og:title',content:'Recycling rewards — ScrapSense'},{property:'og:description',content:'Your verified recycling points.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:Rewards});

/** Matches the "Use the yellow recycling bin instead." guidance sentence. */
const USE_BIN=/Use the ([a-z]+) ([a-z ]+?) bin(?: instead)?\./i;
const swatchFor=(word:string)=>(BIN_SWATCH as Record<string,string|undefined>)[word==='grey'?'gray':word.toLowerCase()];

/** Big, unmissable callout telling the user which bin to use. */
function BinCallout({summary,binMeaning}:{summary:string;binMeaning?:string}){
  const m=USE_BIN.exec(summary);
  const guidance=m?m[0].charAt(0).toUpperCase()+m[0].slice(1):null;
  const reason=guidance?summary.slice(0,m!.index).trim():summary;
  const color=m?swatchFor(m[1]):undefined;
  const text=guidance??(binMeaning||summary);
  return (
    <div className="mt-4 rounded-2xl border-2 border-warning bg-warning/10 p-5 shadow-glow">
      <div className="flex items-center gap-3">
        <Target className="h-7 w-7 shrink-0 text-warning"/>
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-warning">Use this bin</p>
        {color&&<span aria-hidden className="ml-auto h-9 w-9 shrink-0 rounded-lg border-2 border-border" style={{backgroundColor:color}}/>}
      </div>
      <p className="mt-2 text-xl font-bold leading-snug text-foreground">{text}</p>
      {reason&&reason!==text&&<p className="mt-2 text-sm text-muted-foreground">{reason}</p>}
    </div>
  );
}

function Rewards(){
  const qc=useQueryClient();
  const {data:profile}=useQuery(profileQuery);
  const verify=useServerFn(verifyVideo);
  const input=useRef<HTMLInputElement>(null);
  const [file,setFile]=useState<File|null>(null);
  const [url,setUrl]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [result,setResult]=useState<{result:Verification;points:number}|null>(null);

  useEffect(()=>{if(!file){setUrl('');return;}const u=URL.createObjectURL(file);setUrl(u);return()=>URL.revokeObjectURL(u);},[file]);

  const history=useQuery({queryKey:['rewards',profile?.id],enabled:!!profile,queryFn:async()=>{
    const all=[];
    for(let offset=0;;offset+=1000){
      const {data,error}=await supabase.from('video_submissions').select('*').eq('user_id',profile?.id??'').order('created_at',{ascending:false}).range(offset,offset+999);
      if(error)throw error;
      all.push(...data);
      if(data.length<1000)break;
    }
    return all;
  }});

  async function run(){
    if(!file||!profile)return;
    setBusy(true);setMessage('');setResult(null);
    try{
      const ext=file.type==='video/webm'?'webm':file.type==='video/quicktime'?'mov':'mp4';
      const path=profile.id+'/'+crypto.randomUUID()+'.'+ext;
      const {error}=await supabase.storage.from('recycling-videos').upload(path,file,{contentType:file.type,upsert:false});
      if(error)throw error;
      try{setResult(await verify({data:{path}}));}finally{await supabase.storage.from('recycling-videos').remove([path]);}
      await qc.invalidateQueries({queryKey:['rewards']});
    }catch(e){setMessage(e instanceof Error?e.message:'Verification failed.');}
    finally{setBusy(false);}
  }

  const total=history.data?.filter(v=>v.status==='complete').reduce((sum,v)=>sum+(v.points??0),0)??0;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <p className="font-mono text-xs uppercase text-primary">Recycling rewards</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Every item counts.</h1>
        <span className="flex items-center gap-2 text-xl font-bold text-warning"><Trophy/>{total} points</span>
      </div>
      <p className="mt-3 text-muted-foreground">10 points per correctly recycled item · {profile?.country}</p>

      <div className="mt-8 border-y border-border py-6">
        {url?<video src={url} controls className="max-h-96 w-full"/>:<Video className="mx-auto my-6 h-16 w-16 text-primary"/>}
        <input ref={input} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
          onChange={e=>{
            const f=e.target.files?.[0];
            if(!f)return;
            if(!['video/mp4','video/webm','video/quicktime'].includes(f.type)||f.size>50*1024*1024||!f.size){setMessage('Choose a non-empty MP4, WebM or MOV video up to 50 MB.');return;}
            setFile(f);setResult(null);setMessage('');
          }}/>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Show the whole bin (its color or label) and the item clearly before you drop it.</li>
          <li>Keep the camera steady and well lit.</li>
          <li>Correct trash disposal earns 0 points; only correct recycling earns points.</li>
        </ul>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button variant="outline" disabled={busy} onClick={()=>input.current?.click()}><Upload/>Choose video</Button>
          <Button disabled={!file||busy} onClick={run}>{busy?'Verifying recycling…':'Verify & earn points'}</Button>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">Your video is private and removed after review. Unclear actions earn no points.</p>
      </div>

      {message&&<p role="alert" className="mt-5 text-warning">{message}</p>}

      {result&&(
        <div className="mt-6">
          {result.points>0?(
            <h2 className="text-2xl font-bold text-primary">+{result.points} points</h2>
          ):(
            <p className="font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground">0 points earned</p>
          )}
          {result.points===0&&<BinCallout summary={result.result.summary} binMeaning={result.result.binMeaning??''}/>}
          {result.points>0&&<p className="mt-2">{result.result.summary}</p>}
          {result.result.bin&&<p className="mt-3 text-sm text-muted-foreground">Bin seen: {result.result.bin.visible?result.result.bin.color:'not visible'}{result.result.binMeaning?' · '+result.result.binMeaning:''}</p>}
          <ul className="mt-4 divide-y divide-border">
            {result.result.items.map((i,n)=>(
              <li key={n} className="flex gap-3 py-4">
                {i.outcome==='correct'?<CheckCircle2 className="shrink-0 text-primary"/>:<AlertTriangle className="shrink-0 text-warning"/>}
                <div>
                  <h3 className="font-semibold">{i.object} · {itemPoints(i)===10?'+10 points':'0 points'}</h3>
                  <p className={/use the .+ bin/i.test(i.guidance)?'mt-1 text-sm font-medium text-foreground':'mt-1 text-sm text-muted-foreground'}>
                    {i.outcome==='incorrect'?'You misplaced this item. Please put it in the correct bin. ':''}{i.guidance}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mt-10 text-xl font-bold">Recent submissions</h2>
      {history.error&&<p className="mt-4 text-warning">Could not load your points.</p>}
      {history.data?.length===0&&<p className="mt-3 text-muted-foreground">No videos submitted yet.</p>}
      {history.data?.slice(0,20).map(v=>{
        const parsed=verificationSchema.safeParse(v.result);
        return (
          <div key={v.id} className="border-b border-border py-4">
            <div className="flex justify-between gap-4"><span>{new Date(v.created_at).toLocaleDateString()} · {v.status}</span><span className="text-primary">{v.points??0} points</span></div>
            {parsed.success&&<p className="mt-2 text-sm text-muted-foreground">{parsed.data.summary}</p>}
          </div>
        );
      })}
    </section>
  );
}
