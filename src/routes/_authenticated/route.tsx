import {createFileRoute, Outlet, redirect} from '@tanstack/react-router';
import {setHistoryOwner} from '@/lib/history';
import {supabase} from '@/integrations/supabase/client';
export const Route=createFileRoute('/_authenticated')({ssr:false,beforeLoad:async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user)throw redirect({to:'/auth'});setHistoryOwner(user.id);const {data,error}=await supabase.from('profiles').select('full_name,username,country').eq('id',user.id).single();if(error)throw error;if(!data.full_name||!data.username||!data.country)throw redirect({to:'/auth'});},component:Outlet});
