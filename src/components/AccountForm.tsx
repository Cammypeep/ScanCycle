import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Recycle, ArrowRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { countryOptions, profileQuery, profileSchema } from '@/lib/account';
import authBg from '@/assets/auth-flags.jpg';
import { parseIdentifier } from '@/lib/login-identifier';
import { signInWithUsername } from '@/lib/login.functions';
import '@lovable.dev/cloud-auth-js/styles.css';
export function AccountForm(){
 const navigate=useNavigate(); const qc=useQueryClient(); const {data:profile}=useQuery(profileQuery);
 const [mode,setMode]=useState<'signin'|'signup'|'forgot'>('signin'); const [busy,setBusy]=useState(false); const [message,setMessage]=useState('');
 const [ready,setReady]=useState(false);
 useEffect(()=>setReady(true),[]);
 const complete=Boolean(profile && (!profile.full_name || !profile.username || !profile.country));
 useEffect(()=>{if(profile && !complete) navigate({to:'/scan',replace:true});},[profile,complete,navigate]);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage(''); const f=new FormData(e.currentTarget);try{
 if(complete || mode==='signup'){
 const parsed=profileSchema.safeParse({full_name:f.get('full_name'),username:f.get('username'),country:f.get('country'),locality:f.get('locality')||''});if(!parsed.success) throw new Error(parsed.error.issues[0]?.message);
 if(complete && profile){const {error}=await supabase.from('profiles').update(parsed.data).eq('id',profile.id);if(error)throw error;await qc.invalidateQueries({queryKey:['profile']});}
 else {const {error}=await supabase.auth.signUp({email:String(f.get('email')),password:String(f.get('password')),options:{data:parsed.data,emailRedirectTo:window.location.origin+'/auth'}});if(error)throw error;setMessage('Check your email to confirm your account, then sign in.');}
 }else if(mode==='forgot'){const {error}=await supabase.auth.resetPasswordForEmail(String(f.get('email')),{redirectTo:window.location.origin+'/reset-password'});if(error)throw error;setMessage('Check your email for a password reset link.');}
 else{const id=parseIdentifier(String(f.get('email')));const password=String(f.get('password'));
  if(id.kind==='email'){const {error}=await supabase.auth.signInWithPassword({email:id.value,password});if(error)throw error;}
  else{const r=await signInWithUsername({data:{username:id.value,password}}).catch(()=>({error:'Invalid login details'} as const));if('error' in r)throw new Error(r.error);const {error}=await supabase.auth.setSession(r);if(error)throw error;}
  await qc.invalidateQueries({queryKey:['profile']});}
 }catch(e){setMessage(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}}
 async function social(provider:'google'|'lovable'){setMessage('');const r=await lovable.auth.signInWithOAuth(provider,{redirect_uri:window.location.origin+'/auth'});if(r.error)setMessage(r.error.message);else if(!r.redirected)await qc.invalidateQueries({queryKey:['profile']});}
 return <section className="relative min-h-[85vh]"><img src={authBg} alt="" width={1920} height={1088} className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen object-cover"/><div className="relative mx-auto max-w-md px-5 py-12"><div className="rounded-2xl border border-border/60 bg-background/90 p-6 shadow-2xl backdrop-blur-sm"><Recycle className="h-10 w-10 text-primary"/><h1 className="mt-4 text-4xl font-bold">ScanCycle</h1><p className="mt-2 text-muted-foreground">{complete?'Complete your recycling profile.':mode==='signup'?'Create your account. Make every item count.':mode==='forgot'?'Reset your password.':'Join us to make a difference!'}</p>
 {!complete&&<div className="mt-7 flex border-b border-border"><Button variant={mode==='signin'?'secondary':'ghost'} onClick={()=>{setMode('signin');setMessage('');}}>Sign in</Button><Button variant={mode==='signup'?'secondary':'ghost'} onClick={()=>{setMode('signup');setMessage('');}}>Create account</Button></div>}
 <form method="post" onSubmit={submit} className="mt-6 space-y-4">{(complete||mode==='signup')&&<><label className="block text-sm">Full name<Input name="full_name" required maxLength={100} autoComplete="name" defaultValue={profile?.full_name} className="mt-1"/></label><label className="block text-sm">Username<Input name="username" required minLength={3} maxLength={24} pattern="[a-z0-9_]{3,24}" autoComplete="username" defaultValue={profile?.username??''} className="mt-1"/></label><label className="block text-sm">Country<Globe className="ml-2 inline h-4 w-4 text-primary"/><select name="country" required defaultValue={profile?.country??''} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3"><option value="">Choose your country</option>{countryOptions.map(c=><option key={c.code} value={c.name}>{c.name}</option>)}</select></label><label className="block text-sm">City / region (optional)<Input name="locality" maxLength={100} defaultValue={profile?.locality} className="mt-1"/></label><p className="text-xs text-muted-foreground">Bin colors can differ by city. Local bin labels take priority.</p></>}
 {!complete&&<>{mode==='signin'?<label className="block text-sm">Email or username<Input key="id" name="email" required maxLength={255} autoComplete="username" className="mt-1"/></label>:<label className="block text-sm">Email<Input key="em" type="email" name="email" required maxLength={255} autoComplete="email" className="mt-1"/></label>}{mode!=='forgot'&&<label className="block text-sm">Password<Input name="password" type="password" required minLength={8} maxLength={128} autoComplete={mode==='signup'?'new-password':'current-password'} className="mt-1"/></label>}</>}
 {message&&<p role="status" className="text-sm text-warning">{message}</p>}<Button disabled={busy||!ready} className="w-full" size="lg">{busy?'Please wait…':complete?'Save profile':mode==='signup'?'Create account':mode==='forgot'?'Send reset link':'Sign in'}<ArrowRight className="h-4 w-4"/></Button></form>
 {!complete&&<div className="mt-4 space-y-3">{mode==='signin'&&<Button variant="link" onClick={()=>setMode('forgot')}>Forgot password?</Button>}<Button variant="outline" className="w-full" onClick={()=>social('google')}>Continue with Google</Button><Button className="lovable-auth-button w-full" onClick={()=>social('lovable')}>Continue with Lovable</Button></div>}</div></div></section>;
}
