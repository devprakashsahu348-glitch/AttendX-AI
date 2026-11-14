import {NextResponse} from 'next/server';import {sql} from '@/lib/db';import {mailer} from '@/lib/mail';import {pushTo} from '@/lib/push';
export const dynamic='force-dynamic';
export async function GET(req){if(!process.env.CRON_SECRET||req.headers.get('authorization')!=='Bearer '+process.env.CRON_SECRET)return new NextResponse('Unauthorized',{status:401});
const rows=await sql`select t.*,to_char(now() at time zone 'Asia/Kolkata','YYYY-MM-DD') as d,coalesce(nullif(t.teacher_email,''),(select email from users u where u.institution_id=t.institution_id order by id limit 1)) as to_email from timetable t join institutions i on i.id=t.institution_id where t.day=extract(isodow from (now() at time zone 'Asia/Kolkata'))::int and t.start_time between (now() at time zone 'Asia/Kolkata')::time+interval '5 minutes' and (now() at time zone 'Asia/Kolkata')::time+interval '25 minutes' and (i.trial_ends>now() or i.plan_ends>now())`;
const m=mailer();let n=0;
for(const r of rows){const [k]=await sql`insert into sent_log(key) values(${'rem-'+r.id+'-'+r.d}) on conflict do nothing returning key`;if(!k)continue;
const tm=String(r.start_time).slice(0,5),txt=`Your ${r.subject} class starts at ${tm}${r.room?' in '+r.room:''}${r.class_name?' ('+r.class_name+')':''}. Please prepare your attendance session.`;
if(r.to_email)await m.sendMail({from:`AttendX AI <${process.env.GMAIL_USER}>`,to:r.to_email,subject:`Class reminder: ${r.subject} at ${tm}`,text:txt}).catch(()=>{});
await pushTo(r.institution_id,{title:'Class reminder',body:txt}).catch(()=>{});n++}
return NextResponse.json({sent:n})}
