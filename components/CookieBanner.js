'use client';import {useEffect,useState} from 'react';import Link from 'next/link';
export default function C(){const [s,setS]=useState(false);useEffect(()=>{try{setS(!localStorage.getItem('cc'))}catch{}},[]);if(!s)return null;
return(<div className="cc"><span>We use only essential cookies to keep you logged in. See our <Link href="/legal/cookies">Cookie Policy</Link>.</span><button className="btn r" onClick={()=>{try{localStorage.setItem('cc','1')}catch{}setS(false)}}>OK</button></div>)}
