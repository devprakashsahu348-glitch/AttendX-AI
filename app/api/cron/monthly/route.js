import {NextResponse} from 'next/server';import {sql} from '@/lib/db';import {mailer} from '@/lib/mail';import {report,toCsv} from '@/lib/report';
export const dynamic='force-dynamic';const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export async function GET(req){if(!process.env.CRON_SECRET||req.headers.get('authorization')!=='Bearer '+process.env.CRON_SECRET)return new NextResponse('Unauthorized',{status:401});
const [t]=await sql`select extract(day from now() at time zone 'Asia/Kolkata')::int as dd,to_char((now() at time zone 'Asia/Kolkata')-interval '1 month','YYYY-MM') as pm`;
const q=new URL(req.url).searchParams.get('month');const m=/^\d{4}-\d{2}$/.test(q||'')?q:t.pm;if(!q&&t.dd!==1)return NextResponse.json({skipped:true});
const inst=await sql`select i.id,i.name,(select email from users u where u.institution_id=i.id order by id limit 1) as email from institutions i where i.trial_ends>now() or i.plan_ends>now()`;
const tr=mailer();let n=0;
for(const i of inst){if(!i.email)continue;const key='rep-'+i.id+'-'+m;const [k]=await sql`insert into sent_log(key) values(${key}) on conflict do nothing returning key`;if(!k)continue;
const rows=await report(i.id,m);const low=rows.filter(r=>r.pct!==null&&r.pct<75);
const html=`<h2>${esc(i.name)}: attendance report for ${m}</h2><table border="1" cellpadding="6" style="border-collapse:collapse"><tr><th>ID</th><th>Name</th><th>Class</th><th>Total</th><th>Present</th><th>Absent</th><th>%</th></tr>${rows.map(r=>`<tr><td>${esc(r.student_code)}</td><td>${esc(r.name)}</td><td>${esc(r.class_name)}</td><td>${r.total}</td><td>${r.present}</td><td>${r.absent}</td><td>${r.pct===null?'-':r.pct}</td></tr>`).join('')}</table><p>Below 75%: ${low.length?low.map(r=>esc(r.name)).join(', '):'none'}.</p><p>The full report is attached as a CSV file.</p>`;
try{await tr.sendMail({from:`AttendX AI <${process.env.GMAIL_USER}>`,to:i.email,subject:`Attendance report ${m} - ${i.name}`,html,attachments:[{filename:`attendance-${m}.csv`,content:toCsv(rows)}]});n++}catch{await sql`delete from sent_log where key=${key}`}}
return NextResponse.json({sent:n,month:m})}
