import {redirect} from 'next/navigation';import {sql} from '@/lib/db';import {getSession} from '@/lib/auth';import Camera from './Camera';
export const dynamic='force-dynamic';
export default async function C(){const s=await getSession();if(!s||!s.iid)redirect('/login');
const st=await sql`select id,student_code as code,name,face from students where institution_id=${s.iid} order by name`;
return(<main className="w"><h1>Camera attendance</h1><Camera students={st}/></main>)}
