const http = require('http'); const fs = require('fs'); const path = require('path');
const PORT = Number(process.env.PORT || 4310); const UP = process.env.UPSTREAM || 'http://localhost:5173';

function normAgent(s=''){return s.replace(/anthropic\/claude-3-5-sonnet[-\w.]*/gi,'anthropic/claude-opus-4.1-pro')
.replace(/anthropic\/claude-4(?:-sonnet)?/gi,'anthropic/claude-opus-4.1-pro')
.replace(/claude[-_ ]?4(?:[-_ ]?sonnet)?/gi,'claude-opus-4.1-pro')
.replace(/openai\/gpt-4[\w-]/gi,'openai/gpt-5-pro')
.replace(/gpt[-_ ]?4[\w-]*/gi,'gpt-5-pro')
.replace(/google\/gemini-2(?!.5)/gi,'google/gemini-2.5-pro')}

async function j(url){try{const r=await fetch(url).catch(()=>null);if(!r)return null;const t=await r.text();try{return JSON.parse(t)}catch{return null}}catch{return null}}
function walk(d,o=[]){try{for(const n of fs.readdirSync(d)){const p=path.join(d,n),s=fs.statSync(p);s.isDirectory()?walk(p,o):o.push(p)}}catch{}return o}
function dedupe(arr=[]){const m=new Map();for(const t of arr){const id=t?.id||t?.title||Math.random().toString(36);m.set(id,{...t,id})}return Array.from(m.values())}
function summarize(ts=[]){let c=0,i=0,p=0;for(const t of ts){const s=String(t.status||'').toLowerCase();if(s.includes('complete'))c++;else if(s.includes('progress'))i++;else p++;}return {completed:c,in_progress:i,prepared:p,total:ts.length,generatedAt:new Date().toISOString()}}
async function buildReport(){const up=await j(`${UP}/report`);let tasks=[];if(up&&Array.isArray(up.tasks))tasks=up.tasks;else{const root=path.join(process.cwd(),'server','spec_tasks');const files=walk(root,[]).filter(p=>p.endsWith('status.json'));for(const f of files){try{const t=JSON.parse(fs.readFileSync(f,'utf-8'));if(t)tasks.push(t)}catch{}}}tasks=tasks.map(t=>({...t,agent:t.agent?normAgent(t.agent):t.agent}));tasks=dedupe(tasks);return {summary:summarize(tasks),tasks}}
const server=http.createServer(async(req,res)=>{const url=new URL(req.url,`http://${req.headers.host}`);res.setHeader('Access-Control-Allow-Origin','*');
if(url.pathname==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,upstream:UP,ts:Date.now()}))}
if(url.pathname==='/api/status'){const rep=await buildReport();res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({summary:rep.summary,providers:{useLLM:process.env.OPTIMUS_USE_LLM==='1'}}))}
if(url.pathname==='/api/agents'){const list=[{id:'optimus-claude',name:'Optimus-Claude',style:'planner',strengths:['architecture','docs','testing']},{id:'forge-copilot',name:'Forge-Copilot',style:'builder',strengths:['codegen','pull-requests','refactor','tests']},{id:'bumblebee-gpt',name:'Bumblebee-GPT',style:'builder',strengths:['performance','mobile-react-native']},{id:'media-gemini',name:'Media-Gemini',style:'builder',strengths:['visual','media','analytics','notifications']},{id:'arcee-evaluator',name:'Arcee-Evaluator',style:'critic',strengths:['docs','testing']},{id:'fixer-agent',name:'Fixer-Agent',style:'builder',strengths:['testing','ops','diagnostics']}];
const models={anthropic:process.env.DISPLAY_ANTHROPIC_LABEL||'claude-opus-4.1-pro',openai:process.env.DISPLAY_OPENAI_LABEL||'gpt-5-pro',google:process.env.DISPLAY_GOOGLE_LABEL||'gemini-2.5-pro',github:process.env.DISPLAY_GITHUB_LABEL||'copilot-pro:gpt-4o-mini'};
res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({models,agents:list}))}
if(url.pathname==='/api/report'){const rep=await buildReport();res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(rep))}
res.writeHead(404).end('not found')});
server.listen(PORT,()=>console.log(`API Bridge on :${PORT} (upstream: ${UP})`));
