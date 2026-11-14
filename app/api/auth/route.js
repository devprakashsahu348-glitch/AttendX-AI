import {NextResponse} from 'next/server';import {randomBytes} from 'crypto';import bcrypt from 'bcryptjs';import {sql} from '@/lib/db';import {setSession} from '@/lib/auth';
const bad=m=>NextResponse.json({error:m},{status:400});
export async function POST(req){const b=await req.json();const email=String(b.email||'').toLowerCase().trim();const pw=String(b.password||'');
if(!email||pw.length<8)return bad('Enter a valid email and a password of 8 or more characters.');
const A=(process.env.ADMIN_EMAIL||'').toLowerCase();
if(email===A){if(b.action==='login'&&process.env.ADMIN_PASSWORD&&pw===process.env.ADMIN_PASSWORD){await setSession({uid:0,iid:null,role:'superadmin',name:'Admin'});return NextResponse.json({ok:true})}return bad('Wrong email or password.')}
if(b.action==='login'){const [u]=await sql`select * from users where email=${email}`;if(!u||!(await bcrypt.compare(pw,u.password_hash)))return bad('Wrong email or password.');await setSession({uid:u.id,iid:u.institution_id,role:u.role,name:u.name});return NextResponse.json({ok:true})}
if(b.action==='register'){if(!b.agree||!b.institution||!b.name||!['school','college','university'].includes(b.type))return bad('Fill all fields and accept the terms.');
const [x]=await sql`select 1 from users where email=${email}`;if(x)return bad('This email is already registered.');
const [i]=await sql`insert into institutions(name,type,code) values(${b.institution},${b.type},${randomBytes(4).toString('hex')}) returning id`;
const role=email===(process.env.ADMIN_EMAIL||'').toLowerCase()?'superadmin':'principal';
const [u]=await sql`insert into users(institution_id,name,email,password_hash,role) values(${i.id},${b.name},${email},${await bcrypt.hash(pw,10)},${role}) returning id`;
await setSession({uid:u.id,iid:i.id,role,name:b.name});return NextResponse.json({ok:true})}
return bad('Unknown action.')}
