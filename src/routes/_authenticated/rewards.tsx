import {createFileRoute} from '@tanstack/react-router';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useServerFn} from '@tanstack/react-start';
import {useEffect,useMemo,useRef,useState} from 'react';
import {Trophy,Upload,CheckCircle2,AlertTriangle,Video,Target,X,Recycle,Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {supabase} from '@/integrations/supabase/client';
import {profileQuery} from '@/lib/account';
import {verifyVideo,generateSubmissionImage} from '@/lib/rewards.functions';
import {verificationSchema,itemPoints,cooldownRemaining,formatPoints,stripNoPoints,type Verification} from '@/lib/reward-rules';
import {BIN_SWATCH} from '@/lib/scan-types';

export const Route=createFileRoute('/_authenticated/rewards')({head:()=>({meta:[{title:'Recycle — ScrapSense'},{name:'description',content:'Earn points scaled to what you recycle, verified by video.'},{property:'og:title',content:'Recycle — ScrapSense'},{property:'og:description',content:'Your verified recycling points.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:Rewards});

/** Matches the "Use the yellow recycling bin instead." guidance sentence. */
const USE_BIN=/Use the ([a-z]+) ([a-z ]+?) bin(?: instead)?\./i;
const swatchFor=(word:string)=>(BIN_SWATCH as Record<string,string|undefined>)[word==='grey'?'gray':word.toLowerCase()];

/** Big, unmissable callout telling the user which bin to use. */
function BinCallout({summary,binMeaning}:{summary:string;binMeaning?:string}){
  const m=USE_BIN.exec(summary);
  const guidance=m?m[0].charAt(0).toUpperCase()+m[0].slice(1):null;
  const reason=guidance?summary.slice(0,m!.index).trim():summary;
  const color=m?swatchFor(m[1]??''):undefined;
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

/** Grab one frame of a local video as a small JPEG. */
async function grabFrame(file:File,seconds:number):Promise<Blob>{
  const url=URL.createObjectURL(file);
  try{
    const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.src=url;
    await new Promise<void>((res,rej)=>{v.onloadedmetadata=()=>res();v.onerror=()=>rej(new Error('video'));});
    v.currentTime=Math.min(seconds,Math.max(0,(v.duration||0)-0.1));
    await new Promise<void>((res,rej)=>{v.onseeked=()=>res();v.onerror=()=>rej(new Error('seek'));});
    const scale=Math.min(1,480/Math.max(v.videoWidth,v.videoHeight));
    const c=document.createElement('canvas');c.width=Math.round(v.videoWidth*scale);c.height=Math.round(v.videoHeight*scale);
    c.getContext('2d')!.drawImage(v,0,0,c.width,c.height);
    return await new Promise<Blob>((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('blob')),'image/jpeg',0.8));
  }finally{URL.revokeObjectURL(url);}
}

function Rewards(){
  const qc=useQueryClient();
  const {data:profile}=useQuery(profileQuery);
  const verify=useServerFn(verifyVideo);const genImage=useServerFn(generateSubmissionImage);
  const input=useRef<HTMLInputElement>(null);
  const [files,setFiles]=useState<File[]>([]);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [result,setResult]=useState<{result:Verification;points:number}|null>(null);
  const [now,setNow]=useState(Date.now());
  const urls=useMemo(()=>files.map(f=>URL.createObjectURL(f)),[files]);
  useEffect(()=>()=>urls.forEach(u=>URL.revokeObjectURL(u)),[urls]);
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[]);

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
  const thumbPaths=(history.data??[]).slice(0,20).map(v=>v.thumbnail_path).filter((p):p is string=>!!p);
  const thumbs=useQuery({queryKey:['thumbs',thumbPaths],enabled:thumbPaths.length>0,staleTime:30*60_000,queryFn:async()=>{
    const {data}=await supabase.storage.from('submission-thumbnails').createSignedUrls(thumbPaths,3600);
    return Object.fromEntries((data??[]).filter(d=>d.signedUrl).map(d=>[d.path,d.signedUrl]));
  }});
  const lastAt=history.data?.find(v=>v.status!=='failed')?.created_at;
  const left=cooldownRemaining(lastAt,now);
  const countdown=`${Math.floor(left/60000)}:${String(Math.ceil((left%60000)/1000)%60).padStart(2,'0')}`;

  async function run(){
    if(!files.length||!profile)return;
    setBusy(true);setMessage('');setResult(null);
    const paths:string[]=[];
    try{
      for(const file of files){
        const ext=file.type==='video/webm'?'webm':file.type==='video/quicktime'?'mov':'mp4';
        const path=profile.id+'/'+crypto.randomUUID()+'.'+ext;
        const {error}=await supabase.storage.from('recycling-videos').upload(path,file,{contentType:file.type,upsert:false});
        if(error)throw error;
        paths.push(path);
      }
      const r=await verify({data:{paths}});setResult(r);
      setFiles([]);await qc.invalidateQueries({queryKey:['rewards']});
      try{const g=await genImage({data:{id:r.id}});if(g.ok)await qc.invalidateQueries({queryKey:['rewards']});}catch{/* picture is optional */}
    }catch(e){setMessage(e instanceof Error?e.message:'Verification failed.');}
    finally{
      if(paths.length)await supabase.storage.from('recycling-videos').remove(paths);
      await qc.invalidateQueries({queryKey:['rewards']});
      setBusy(false);
    }
  }

  const total=Math.round((history.data?.filter(v=>v.status==='complete').reduce((sum,v)=>sum+Number(v.points_awarded??0),0)??0)*10)/10;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <p className="font-mono text-xs uppercase text-primary">Recycling rewards</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Every item counts.</h1>
        <span className="flex items-center gap-2 text-xl font-bold text-warning"><Trophy/>{formatPoints(total)} points</span>
      </div>
      <p className="mt-3 text-muted-foreground">Points scale with what you recycle: a sheet of paper is 0.1, a water bottle is 10 · {profile?.country}</p>

      <div className="mt-8 border-y border-border py-6">
        {files.length?(
          <div className="grid gap-3 sm:grid-cols-2">
            {files.map((f,n)=>(
              <div key={urls[n]} className="relative">
                <video src={urls[n]} controls className="max-h-60 w-full rounded-lg"/>
                <Button size="icon" variant="secondary" aria-label={'Remove '+f.name} disabled={busy} className="absolute right-2 top-2" onClick={()=>setFiles(files.filter((_,i)=>i!==n))}><X/></Button>
              </div>
            ))}
          </div>
        ):<Video className="mx-auto my-6 h-16 w-16 text-primary"/>}
        <input ref={input} type="file" multiple accept="video/mp4,video/webm,video/quicktime" className="hidden"
          onChange={e=>{
            const picked=[...(e.target.files??[])];e.target.value='';
            if(!picked.length)return;
            const next=[...files,...picked];
            if(picked.some(f=>!['video/mp4','video/webm','video/quicktime'].includes(f.type)||!f.size)){setMessage('Choose non-empty MP4, WebM or MOV videos.');return;}
            if(next.length>5){setMessage('You can send up to 5 videos at once.');return;}
            if(next.reduce((s,f)=>s+f.size,0)>50*1024*1024){setMessage('Keep all videos together under 50 MB.');return;}
            setFiles(next);setResult(null);setMessage('');
          }}/>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Recycle in bulk: you can send up to 5 videos together.</li>
          <li>Show the whole bin (its color or label) and the items clearly before you drop them.</li>
          <li>Correct trash disposal earns 0 points; only correct recycling earns points.</li>
        </ul>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button variant="outline" disabled={busy||files.length>=5} onClick={()=>input.current?.click()}><Upload/>{files.length?'Add video':'Choose videos'}</Button>
          <Button disabled={!files.length||busy||left>0} onClick={run}>{busy?'Verifying recycling…':left>0?`Next submission in ${countdown}`:`Verify ${files.length>1?files.length+' videos':''} & earn points`}</Button>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">Your videos are private and removed after review. Unclear actions earn no points.</p>
      </div>

      {message&&<p role="alert" className="mt-5 text-warning">{message}</p>}

      {result&&(
        <div className="mt-6">
          {result.points>0?(
            <h2 className="text-2xl font-bold text-primary">+{formatPoints(result.points)} points</h2>
          ):(
            <p className="font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground">0 points earned</p>
          )}
          {result.points===0&&<BinCallout summary={stripNoPoints(result.result.summary)} binMeaning={stripNoPoints(result.result.binMeaning??'')}/>}
          {result.points>0&&<p className="mt-2">{result.result.summary}</p>}
          {result.points>0&&result.result.bin&&<p className="mt-3 text-sm text-muted-foreground">Bin seen: {result.result.bin.visible?result.result.bin.color:'not visible'}{result.result.binMeaning?' · '+result.result.binMeaning:''}</p>}
          <ul className="mt-4 divide-y divide-border">
            {result.result.items.map((i,n)=>(
              <li key={n} className="flex gap-3 py-4">
                {i.outcome==='correct'?<CheckCircle2 className="shrink-0 text-primary"/>:<AlertTriangle className="shrink-0 text-warning"/>}
                <div>
                  <h3 className="font-semibold">{i.object}{(i.quantity??1)>1?' ×'+i.quantity:''} · {itemPoints(i)>0?'+'+formatPoints(itemPoints(i))+' points':'0 points'}</h3>
                  {result.points>0&&<p className={/use the .+ bin/i.test(i.guidance)?'mt-1 text-sm font-medium text-foreground':'mt-1 text-sm text-muted-foreground'}>
                    {i.outcome==='incorrect'?'You misplaced this item. Please put it in the correct bin. ':''}{i.guidance}
                  </p>}
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
          <div key={v.id} className="flex gap-4 border-b border-border py-4">
            {v.thumbnail_path&&thumbs.data?.[v.thumbnail_path]?<img src={thumbs.data[v.thumbnail_path]} alt="Recycled item" className="h-16 w-16 shrink-0 rounded-lg object-cover"/>:parsed.success&&parsed.data.items.length>0&&parsed.data.items.every(i=>itemPoints(i)===0&&(i.stream==='trash'||i.stream==='compost'))?<span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-muted"><Trash2 className="h-7 w-7 text-muted-foreground"/></span>:<span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-accent"><Recycle className="h-7 w-7 text-primary"/></span>}
            <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-4"><span>{new Date(v.created_at).toLocaleDateString()} · {v.status}</span><span className="text-primary">{formatPoints(Number(v.points_awarded??0))} points</span></div>
            {parsed.success&&<p className="mt-2 text-sm text-muted-foreground">{stripNoPoints(parsed.data.summary)}</p>}
            </div>
          </div>
        );
      })}
    </section>
  );
}
