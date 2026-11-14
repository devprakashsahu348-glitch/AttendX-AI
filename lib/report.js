import {sql} from '@/lib/db';
export async function report(iid,m){const r=await sql`select s.student_code,s.name,s.class_name,count(a.id) filter(where a.status='present')::int as present,count(a.id) filter(where a.status='absent')::int as absent from students s left join attendance a on a.student_id=s.id and to_char(a.day,'YYYY-MM')=${m} where s.institution_id=${iid} group by s.id order by s.class_name,s.name`;
return r.map(x=>{const t=x.present+x.absent;return{...x,total:t,pct:t?Math.round(1000*x.present/t)/10:null}})}
const q=v=>{let t=String(v??'');if(/^[=+\-@]/.test(t))t="'"+t;return `"${t.replace(/"/g,'""')}"`};
export const toCsv=rows=>['Student ID,Name,Class,Total,Present,Absent,Percentage',...rows.map(r=>[r.student_code,r.name,r.class_name,r.total,r.present,r.absent,r.pct??''].map(q).join(','))].join('\n');
