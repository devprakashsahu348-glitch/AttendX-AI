'use client';
export default function C({msg,children}){return <button className="btn r" onClick={e=>{if(!confirm(msg))e.preventDefault()}}>{children}</button>}
