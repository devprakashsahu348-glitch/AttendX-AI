import {getSession} from '@/lib/auth';import {report} from '@/lib/report';
const q=v=>{let t=String(v??'');if(/^[=+\-@]/.test(t))t="'"+t;return `"${t.replace(/"/g,'""')}"`};
export async function GET(req){const s=await getSession();if(!s||!s.iid)return new Response('Unauthorized',{status:401});
const m=new URL(req.url).searchParams.get('month')||'';if(!/^\d{4}-\d{2}$/.test(m))return new Response('Bad month',{status:400});
const rows=await report(s.iid,m);
const csv=['Student ID,Name,Class,Total,Present,Absent,Percentage',...rows.map(r=>[r.student_code,r.name,r.class_name,r.total,r.present,r.absent,r.pct??''].map(q).join(','))].join('\n');
return new Response(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':`attachment; filename="attendance-${m}.csv"`}})}
