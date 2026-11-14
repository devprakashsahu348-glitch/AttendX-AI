import {NextResponse} from 'next/server';import {sql} from '@/lib/db';
const bad=m=>NextResponse.json({error:m},{status:400});
export async function POST(req){const b=await req.json();const code=String(b.code||'').trim(),sid=String(b.sid||'').trim();
if(!code||!sid||!b.agree||!Array.isArray(b.desc)||b.desc.length!==128||!b.desc.every(Number.isFinite))return bad('Fill all fields and accept the agreement.');
const [i]=await sql`select id from institutions where code=${code} and (trial_ends>now() or plan_ends>now())`;if(!i)return bad('Institution code not found or not active.');
const [s]=await sql`select id,face from students where institution_id=${i.id} and student_code=${sid}`;if(!s)return bad('This ID was not found. Check it with your teacher.');
if(s.face)return bad('A face is already saved for this ID. Ask your teacher to reset it.');
await sql`update students set face=${JSON.stringify(b.desc)}::jsonb,face_consent=true where id=${s.id} and face is null`;return NextResponse.json({ok:true})}
