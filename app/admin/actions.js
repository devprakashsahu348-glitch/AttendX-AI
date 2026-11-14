'use server';import {sql} from '@/lib/db';import {getSession} from '@/lib/auth';import {revalidatePath} from 'next/cache';
export async function setPlan(f){const s=await getSession();if(s?.role!=='superadmin')throw new Error('auth');const n=Math.max(1,+f.get('n')||1);const m=f.get('unit')==='years'?n*12:n;const p=['school','college','university'].includes(f.get('plan'))?f.get('plan'):'school';
await sql`update institutions set plan=${p},plan_ends=now()+make_interval(months=>${m}::int) where id=${+f.get('id')}`;revalidatePath('/admin')}
