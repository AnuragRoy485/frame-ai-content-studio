import {NextResponse} from 'next/server';
export function GET(){return NextResponse.json({aiConfigured:!!process.env.GEMINI_API_KEY,publisher:'mock'})}
