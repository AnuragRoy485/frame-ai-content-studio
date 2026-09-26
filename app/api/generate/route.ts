import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
const channels = ['Instagram','YouTube','X'] as const;
const rules = {Instagram:{ratio:'4:5',limit:2200},YouTube:{ratio:'16:9',limit:5000},X:{ratio:'1:1',limit:280}};
function clean(v:unknown,n=500){return String(v||'').replace(/[<>]/g,'').slice(0,n)}
function bilingualCaption(p:{bengali?:unknown;english?:unknown;caption?:unknown},channel:typeof channels[number]){
 const original=clean(p.caption,5000).trim();
 const bn=clean(p.bengali,400).trim(),en=clean(p.english,400).trim();
 const limit=rules[channel].limit;
 if(original.length<=limit && /[\u0980-\u09FF]/.test(original) && /[A-Za-z]/.test(original))return original;
 // The model can miss a language in the publish caption: restore its two original, independently generated fields.
 const max=channel==='X'?88:300;
 const short=(v:string)=>v.length<=max?v:v.slice(0,max).replace(/\s+\S*$/,'').trim()+'…';
 const caption=`${short(bn)}\n\n${short(en)}\n\n${channel==='X'?'Follow for updates! #SheshChithi':'Follow for updates. #BengaliStories #CreativeStudio'}`;
 return caption.slice(0,limit);
}
async function generateInternal(req:NextRequest){
 try{
  const input=await req.json(); const brief=clean(input.brief,1200); const title=clean(input.title,100); const audience=clean(input.audience,100);
  if(!title || brief.length<20) return NextResponse.json({error:'Add a title and a brief of at least 20 characters.'},{status:400});
  const key=process.env.GEMINI_API_KEY; if(!key) return NextResponse.json({error:'AI is not configured yet. Add GEMINI_API_KEY in Vercel project settings.'},{status:503});
  const context=clean(input.insight,350);
  const prompt=`You are a native Bengali and English OTT creative strategist. Generate distinctive social launch creative for fictional streaming title "${title}". Brief: ${brief}. Audience: ${audience||'Bengali-language streaming audiences'}. Previous campaign insight to act on: ${context||'none'}. Generate original Bengali and English copy directly in each language, NEVER translate one from the other. Each channel must have a DIFFERENT visual scene/concept, not the same art cropped. Instagram: emotional character-driven poster, native Bengali conversational copy with 2-4 hashtags and CTA. YouTube: cinematic wide thumbnail concept and search-friendly bilingual Bengali and English description with CTA. X: graphic editorial square concept, sharp bilingual short copy within 280 characters. Avoid using actual hoichoi titles, real actors, brand trademarks or promising a trailer, streaming release, or film footage. CTAs should say follow for updates rather than watch a nonexistent video. Return ONLY JSON object {"rationale":"one sentence", "posts":[{"channel":"Instagram|YouTube|X","headline":"max 8 words","bengali":"native Bengali copy","english":"English copy","caption":"channel-ready bilingual caption including CTA and suitable hashtags","visual":"specific illustrative scene composition, not an image URL","palette":["#hex","#hex","#hex"],"motif":"one of moon,rain,city,letter,train,window","scene":[{"kind":"rect|circle|line|polygon","x":0.1,"y":0.2,"w":0.3,"h":0.4,"r":0.1,"x2":0.5,"y2":0.6,"points":[0.1,0.1,0.8,0.1,0.5,0.7],"fill":"#hex","stroke":"#hex","sw":2,"opacity":0.8}]}]}. Exactly 3 posts, one per channel. Every publishing caption MUST contain native Bengali script AND original English copy, with platform-suitable hashtags and CTA. X caption must fit both languages, CTA and hashtags within 280 characters. Draw each scene as 12-25 distinct geometric shape objects, with coordinates normalized to 0-1; use rect, circle, polygon and line. The shapes MUST portray the specific scene in your visual description, using recognizable architecture, figures, props, rain, etc. Reserve the lower 25 percent for an overlaid headline. Do not reuse a scene across channels. All captions respect Instagram 2200, YouTube 5000, X 280 characters. No markdown fences.`;
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{responseMimeType:'application/json',temperature:.85}}),cache:'no-store',signal:AbortSignal.timeout(28000)});
  const raw=await r.json(); if(!r.ok) return NextResponse.json({error:`AI request failed (${r.status}). Check API key/quota.`},{status:502});
  const txt=raw.candidates?.[0]?.content?.parts?.map((p:{text?:string})=>p.text||'').join('')||''; let parsed; try{parsed=JSON.parse(txt)}catch{return NextResponse.json({error:'AI returned invalid JSON. Retry generation.'},{status:502})}
  if(!Array.isArray(parsed.posts) || parsed.posts.length!==3 || channels.some(c=>parsed.posts.filter((p:{channel:string})=>p.channel===c).length!==1)) return NextResponse.json({error:'AI response missed required channels. Retry.'},{status:502});
  const posts=channels.map(channel=>{let p=parsed.posts.find((x:{channel:string})=>x.channel===channel); let colors=(Array.isArray(p.palette)?p.palette:[]).map((x:unknown)=>/^#[0-9a-fA-F]{6}$/.test(String(x))?x:'#282037');return {id:crypto.randomUUID(),channel,headline:clean(p.headline,70),bengali:clean(p.bengali,400),english:clean(p.english,400),caption:bilingualCaption(p,channel),visual:clean(p.visual,300),palette:[colors[0]||'#E99482',colors[1]||'#1B1C30',colors[2]||'#F9E0BA'],motif:['moon','rain','city','letter','train','window'].includes(p.motif)?p.motif:'moon',scene:Array.isArray(p.scene)?p.scene.slice(0,36).map((x:Record<string,unknown>)=>({kind:['rect','circle','line','polygon'].includes(String(x.kind))?x.kind:'circle',x:Number(x.x)||0,y:Number(x.y)||0,w:Number(x.w)||0,h:Number(x.h)||0,r:Number(x.r)||0,x2:Number(x.x2)||0,y2:Number(x.y2)||0,points:Array.isArray(x.points)?x.points.slice(0,60).map(Number):[],fill:String(x.fill||'#ead4c6'),stroke:String(x.stroke||''),sw:Number(x.sw)||0,opacity:Number(x.opacity)||1})):[],ratio:rules[channel].ratio,status:'draft',createdAt:new Date().toISOString()}});
  return NextResponse.json({posts,rationale:clean(parsed.rationale,300),model:'AI creative engine'});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Generation failed'},{status:500})}
}

// Flush JSON whitespace early and keep the connection active while Gemini thinks.
// Whitespace is valid before a JSON document and the client still receives one JSON object.
export async function POST(req:NextRequest){
 const encoder=new TextEncoder();
 const stream=new ReadableStream<Uint8Array>({
  start(controller){
   controller.enqueue(encoder.encode(' '));
   const heartbeat=setInterval(()=>{try{controller.enqueue(encoder.encode(' '))}catch{}},2500);
   void generateInternal(req).then(async result=>{
    clearInterval(heartbeat);
    controller.enqueue(encoder.encode(await result.text()));
    controller.close();
   }).catch(error=>{
    clearInterval(heartbeat);
    controller.enqueue(encoder.encode(JSON.stringify({error:error instanceof Error?error.message:'Generation failed'})));
    controller.close();
   });
  }
 });
 return new Response(stream,{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
