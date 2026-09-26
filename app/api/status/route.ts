import {NextResponse} from 'next/server';
export function GET(){return NextResponse.json({aiConfigured:!!process.env.GEMINI_API_KEY,model:'gemini-2.5-flash-lite',publisher:'mock'})}
