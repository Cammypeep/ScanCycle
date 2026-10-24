import {createFileRoute} from '@tanstack/react-router';
import {AccountForm} from '@/components/AccountForm';
export const Route=createFileRoute('/auth')({head:()=>({meta:[{title:'Sign in — ScrapSense'},{name:'description',content:'Sign in or create your ScrapSense recycling account.'},{property:'og:title',content:'Sign in — ScrapSense'},{property:'og:description',content:'Your recycling profile and rewards.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:AccountForm});
