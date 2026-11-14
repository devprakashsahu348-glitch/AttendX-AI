import {NextResponse} from 'next/server';import {cookies} from 'next/headers';
export async function GET(req){cookies().delete('s');return NextResponse.redirect(new URL('/',req.url))}
