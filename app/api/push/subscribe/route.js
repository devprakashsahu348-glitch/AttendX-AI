import {NextResponse} from 'next/server';import {sql} from '@/lib/db';import {getSession} from '@/lib/auth';
export async function POST(req){const s=await getSession();if(!s||!s.iid)return NextResponse.json({error:'login'},{status:401});const b=await req.json();if(!b?.endpoint)return NextResponse.json({error:'bad'},{status:400});
await sql`insert into push_subs(institution_id,endpoint,sub) values(${s.iid},${b.endpoint},${JSON.stringify(b)}::jsonb) on conflict(endpoint) do update set institution_id=${s.iid},sub=excluded.sub`;return NextResponse.json({ok:true})}
