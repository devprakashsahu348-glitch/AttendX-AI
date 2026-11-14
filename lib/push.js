import webpush from 'web-push';import {sql} from '@/lib/db';
export async function pushTo(iid,p){if(!process.env.VAPID_PRIVATE_KEY)return;webpush.setVapidDetails('mailto:'+process.env.ADMIN_EMAIL,process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
const subs=await sql`select endpoint,sub from push_subs where institution_id=${iid}`;
for(const s of subs){try{await webpush.sendNotification(s.sub,JSON.stringify(p))}catch(e){if(e.statusCode===404||e.statusCode===410)await sql`delete from push_subs where endpoint=${s.endpoint}`}}}
