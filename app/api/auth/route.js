import {NextResponse} from 'next/server';import {randomBytes,randomInt,createHash,timingSafeEqual} from 'crypto';import bcrypt from 'bcryptjs';import {sql} from '@/lib/db';import {setSession} from '@/lib/auth';import {mailer} from '@/lib/mail';
const bad=m=>NextResponse.json({error:m},{status:400});
const hash=(e,c)=>createHash('sha256').update(process.env.JWT_SECRET+'|'+e+'|'+c).digest('hex');
async function checkOtp(email,otp){const [o]=await sql`select * from email_otps where email=${email}`;if(!o||new Date(o.expires_at)<new Date())return{err:'The code expired. Go back and ask for a new one.'};
if(o.tries>=5){await sql`delete from email_otps where email=${email}`;return{err:'Too many wrong tries. Ask for a new code.'}}
const a=Buffer.from(hash(email,String(otp||'').trim())),c=Buffer.from(o.code_hash);
if(a.length!==c.length||!timingSafeEqual(a,c)){await sql`update email_otps set tries=tries+1 where email=${email}`;return{err:'Wrong code. Try again.'}}
return{o}}
export async function POST(req){const b=await req.json();const email=String(b.email||'').toLowerCase().trim();const pw=String(b.password||'');const act=b.action;
if(!email)return bad('Enter a valid email.');
if((act==='login'||act==='setpw')&&pw.length<8)return bad('Use a password of 8 or more characters.');
const A=(process.env.ADMIN_EMAIL||'').toLowerCase();
if(email===A){if(act==='login'&&process.env.ADMIN_PASSWORD&&pw===process.env.ADMIN_PASSWORD){await setSession({uid:0,iid:null,role:'superadmin',name:'Admin'});return NextResponse.json({ok:true})}return bad('Wrong email or password.')}
if(act==='login'){const [u]=await sql`select * from users where email=${email}`;if(!u||!(await bcrypt.compare(pw,u.password_hash)))return bad('Wrong email or password.');await setSession({uid:u.id,iid:u.institution_id,role:u.role,name:u.name});return NextResponse.json({ok:true})}
if(act==='register'){
if(!b.agree||!b.institution||!b.name||!['school','college','university'].includes(b.type))return bad('Fill all fields and accept the terms.');
const [x]=await sql`select 1 from users where email=${email}`;if(x)return bad('This email is already registered. Please log in.');
const [o]=await sql`select 1 from email_otps where email=${email} and sent_at>now()-interval '60 seconds'`;if(o)return bad('Please wait a minute before asking for a new code.');
const code=String(randomInt(100000,1000000));
const data={institution:String(b.institution).slice(0,120),type:b.type,name:String(b.name).slice(0,120)};
await sql`insert into email_otps(email,code_hash,data,sent_at,expires_at,tries) values(${email},${hash(email,code)},${JSON.stringify(data)}::jsonb,now(),now()+interval '15 minutes',0) on conflict(email) do update set code_hash=excluded.code_hash,data=excluded.data,sent_at=now(),expires_at=excluded.expires_at,tries=0`;
try{await mailer().sendMail({from:`AttendX AI <${process.env.GMAIL_USER}>`,to:email,subject:'Your AttendX AI verification code',text:`Your verification code is ${code}. It works for 15 minutes. If you did not ask for it, ignore this email.`})}catch{await sql`delete from email_otps where email=${email}`;return bad('Could not send the email. Please try again later.')}
return NextResponse.json({ok:true,verify:true})}
if(act==='verify'){const r=await checkOtp(email,b.otp);return r.err?bad(r.err):NextResponse.json({ok:true})}
if(act==='setpw'){const r=await checkOtp(email,b.otp);if(r.err)return bad(r.err);const d=r.o.data;
const [x]=await sql`select 1 from users where email=${email}`;if(x)return bad('This email is already registered. Please log in.');
const [i]=await sql`insert into institutions(name,type,code) values(${d.institution},${d.type},${randomBytes(4).toString('hex')}) returning id`;
const [u]=await sql`insert into users(institution_id,name,email,password_hash,role) values(${i.id},${d.name},${email},${await bcrypt.hash(pw,10)},'principal') returning id`;
await sql`delete from email_otps where email=${email}`;await setSession({uid:u.id,iid:i.id,role:'principal',name:d.name});return NextResponse.json({ok:true})}
return bad('Unknown action.')}
