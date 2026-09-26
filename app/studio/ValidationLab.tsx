'use client';
import {useState} from 'react';
import {Post,validatePost} from '../logic';
type Probe={label:string;issues:string[];accepted:boolean};
export default function ValidationLab({posts}:{posts:Post[]}){
 const [probe,setProbe]=useState<Probe|null>(null);
 const [checking,setChecking]=useState(false);
 const draft=posts.find(p=>p.status!=='published')||posts[0];
 function demo(kind:'ratio'|'size'|'caption'){
  if(!draft)return;
  const actual=validatePost(draft).asset;
  const bad=kind==='ratio'?{...actual,width:1000,height:draft.ratio==='1:1'?500:1000}:kind==='size'?{...actual,bytes:2_000_001}:actual;
  const test=kind==='caption'?{...draft,caption:'A'.repeat((draft.channel==='X'?280:draft.channel==='Instagram'?2200:5000)+1)}:draft;
  const result=validatePost(test,bad);
  setProbe({label:kind==='ratio'?'Wrong aspect ratio':kind==='size'?'Oversized asset':'Overlong caption',issues:result.errors,accepted:result.valid});
 }
 async function upload(file:File){if(!draft)return;setChecking(true);try{
  let width=0,height=0;try{const bmp=await createImageBitmap(file);width=bmp.width;height=bmp.height;bmp.close()}catch{}
  const res=validatePost(draft,{mime:file.type,bytes:file.size,width,height});
  setProbe({label:`Uploaded ${file.name}`,issues:res.errors,accepted:res.valid});
 }finally{setChecking(false)}}
 return <section className="validation-lab" aria-label="Adapter validation lab"><div><span className="kicker">ADAPTER / LIVE TEST</span><h3>Test the guardrail.</h3><p>Run the real validator against a bad ratio, oversize file or overlong caption. No demo test enters the queue.</p></div>{draft?<><div className="lab-buttons"><button onClick={()=>demo('ratio')}>Wrong ratio</button><button onClick={()=>demo('size')}>Oversized file</button><button onClick={()=>demo('caption')}>Overlong caption</button><label>Test your image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);e.target.value=''}}/></label></div>{checking&&<p role="status">Inspecting file...</p>}{probe&&<div className={probe.accepted?'lab-pass':'lab-reject'} role="status"><strong>{probe.accepted?'ACCEPTED':'REJECTED'} / {probe.label}</strong><ul>{probe.issues.length?probe.issues.map((x,i)=><li key={i}>{x}</li>):<li>Asset and copy satisfy the adapter checks.</li>}</ul></div>}</>:<p>Generate a campaign to unlock adapter tests.</p>}</section>
}
