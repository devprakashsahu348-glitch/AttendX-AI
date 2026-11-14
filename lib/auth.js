import {SignJWT,jwtVerify} from 'jose';import {cookies} from 'next/headers';
const key=()=>new TextEncoder().encode(process.env.JWT_SECRET);
export async function setSession(p){const t=await new SignJWT(p).setProtectedHeader({alg:'HS256'}).setExpirationTime('7d').sign(key());cookies().set('s',t,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:604800})}
export async function getSession(){try{const t=cookies().get('s')?.value;return t?(await jwtVerify(t,key())).payload:null}catch{return null}}
