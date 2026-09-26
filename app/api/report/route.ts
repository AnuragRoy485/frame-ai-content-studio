import { NextRequest,NextResponse } from 'next/server';
export const runtime='nodejs';
async function reportInternal(req:NextRequest){try{
 const {posts}=await req.json(); const published=Array.isArray(posts)?posts.filter(p=>p.status==='published'&&p.metrics&&p.postId).slice(0,30):[];
 if(published.length<3)return NextResponse.json({error:'Publish and ingest metrics for all three channels first.'},{status:400});
 const key=process.env.GEMINI_API_KEY;if(!key)return NextResponse.json({error:'AI report unavailable: GEMINI_API_KEY is not configured.'},{status:503});
 const facts=published.map(p=>({postId:String(p.postId).slice(0,40),channel:p.channel,headline:String(p.headline).slice(0,80),impressions:Number(p.metrics.impressions)||0,engagements:Number(p.metrics.engagements)||0,clicks:Number(p.metrics.clicks)||0,engagementRate:+((Number(p.metrics.engagements)||0)/Math.max(1,Number(p.metrics.impressions))*100).toFixed(2),ctr:+((Number(p.metrics.clicks)||0)/Math.max(1,Number(p.metrics.impressions))*100).toFixed(2)}));
 const prompt=`You are a streaming content insights analyst. Write concise weekly campaign analysis using ONLY the provided mock/simulated metrics (never claim real platform analytics). Compare same campaign across platforms using normalized engagement and click-through rates, not raw totals. Every numeric claim MUST cite exact post IDs in square brackets, e.g. [IG-123]. State one concrete hypothesis for next brief and the limitation that these are simulated. Output JSON only: {"summary":"3 sentences with post ID citations","nextBrief":"specific action for next campaign, one sentence","winningChannel":"Instagram|YouTube|X"}. Facts: ${JSON.stringify(facts)}`;
 const requestBody=JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json',temperature:.3}});
 let data:any, model='gemini-2.5-flash';
 // Use only models with a documented free text tier. Retry transient capacity
 // failures on a separate pool; never retry a rejected key or bad request.
 for(const [i,name] of ['gemini-2.5-flash','gemini-3.1-flash-lite','gemini-3.1-flash-lite'].entries()){
  model=name;
  if(i)await new Promise(resolve=>setTimeout(resolve,600*i+Math.floor(Math.random()*200)));
  try{
   const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${name}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:requestBody,cache:'no-store',signal:AbortSignal.timeout(i===0?18000:23000)});
   data=await r.json();
   if(r.ok)break;
   console.warn('Report provider failure',{model:name,status:r.status,reason:data?.error?.status});
   if([400,401,403].includes(r.status))return NextResponse.json({error:'AI report key or request was rejected. Check the project API key and configuration.'},{status:502});
   if(![408,429,500,502,503,504].includes(r.status)||i===2)return NextResponse.json({error:r.status===429?'AI free-tier rate limit reached. Try again later.':`AI report service unavailable (${r.status}). Try again shortly.`},{status:502});
  }catch(e){
   console.warn('Report provider timeout',{model:name,error:e instanceof Error?e.name:'unknown'});
   if(i===2)return NextResponse.json({error:'The AI report service timed out across available free models. Try again later.'},{status:502});
  }
 }
 const parsed=JSON.parse(data.candidates?.[0]?.content?.parts?.map((p:{text:string})=>p.text).join('')||'{}');let summary=String(parsed.summary||'').slice(0,1800);if(!published.some(p=>summary.includes(`[${p.postId}]`)))return NextResponse.json({error:'AI report lacked post ID citations. Retry.'},{status:502});return NextResponse.json({summary,nextBrief:String(parsed.nextBrief||'').slice(0,320),winningChannel:parsed.winningChannel,model:'AI creative engine',generationModel:model,sourcePostIds:facts.map(x=>x.postId)});
}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Report failed'},{status:500})}}

// Send whitespace heartbeats while the provider thinks to keep the demo request
// open. One JSON object follows; no partial report is ever committed.
export async function POST(req:NextRequest){
 const encoder=new TextEncoder();
 const stream=new ReadableStream<Uint8Array>({start(controller){
  controller.enqueue(encoder.encode(' '));
  const heartbeat=setInterval(()=>{try{controller.enqueue(encoder.encode(' '))}catch{}},2500);
  void reportInternal(req).then(async result=>{
   clearInterval(heartbeat);controller.enqueue(encoder.encode(await result.text()));controller.close();
  }).catch(error=>{
   clearInterval(heartbeat);controller.enqueue(encoder.encode(JSON.stringify({error:error instanceof Error?error.message:'Report failed'})));controller.close();
  });
 }});
 return new Response(stream,{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
