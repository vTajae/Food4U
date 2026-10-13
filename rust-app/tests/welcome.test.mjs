import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import { base, seedFixture, login, cookieValue, session, logout, jsonRequest } from './auth-fixtures.mjs';
const control = process.env.FOOD4U_MOCK_CONTROL_URL;
assert.equal(new URL(control).hostname, '127.0.0.1');
const cookies=[];
async function command(path,body) {
  const res=await fetch(new URL(path,control),{method:body?'POST':'GET',headers:body?{'content-type':'application/json'}:{},...(body?{body:JSON.stringify(body)}:{})});
  assert.equal(res.status,200); return res.json();
}
async function user(welcome={isComplete:false}) {
  const fixture=await seedFixture(); const cookie=cookieValue(await login(fixture)); cookies.push(cookie);
  const id=cookie.slice(0,cookie.lastIndexOf('.')); const data=await session(id); data.welcome=welcome;
  await jsonRequest('/_spike/session',{id,data},'PUT');
  await command('token',{publicId:fixture.row.public_id,username:fixture.row.username,role:fixture.row.user_role,token:data.token});
  return {...fixture,cookie,id,data};
}
const submission={submission:[{questionId:5,queryKey:'cuisines',answers:[{name:'Mediterranean'}]},{questionId:555,queryKey:'price',answers:[{value:'12.50'}]}]};
const expect=(u,rest={})=>command('expect',{user:u.row.public_id,method:'POST',path:'/backend/welcome',body:submission,response:{ok:true},...rest});
async function request(u,path='/welcome',body,raw=false) {
  const response=await fetch(`${base}${path}`,{method:body===undefined?'GET':'POST',redirect:'manual',headers:{origin:base,...(u?{cookie:`__session=${u.cookie}`}:{ }),...(body===undefined?{}:{'content-type':'application/json'})},...(body===undefined?{}:{body:raw?body:JSON.stringify(body)}),signal:AbortSignal.timeout(30000)});
  return {status:response.status,location:response.headers.get('location'),cookie:response.headers.get('set-cookie'),text:await response.text()};
}
function redirect(response,path){assert.equal(response.status,303);assert.equal(new URL(response.location,base).pathname,path);}
function failure(response,message="Couldn't save your profile. Please try again."){assert.equal(response.status,200);assert.deepEqual(JSON.parse(response.text),{ok:false,message});}
afterEach(async()=>{for(const cookie of cookies.splice(0))await logout(cookie);const report=await command('report');assert.deepEqual(report.violations,[]);assert.deepEqual(report.pending,[]);});
test('welcome backend failure returns the explicit review-preserving failure message',async()=>{
  const u=await user();await expect(u,{status:500,response:{detail:'local outage'}});failure(await request(u,'/welcome',submission));assert.deepEqual((await session(u.id)).welcome,{isComplete:false});
});
test('authentication precedes malformed payload parsing and welcome requires auth',async()=>{
  redirect(await request(null),'/login');redirect(await request(null,'/welcome','{',true),'/login');
});
test('success sends exact parsed body and request bearer and marks existing session complete',async()=>{
  const u=await user();await expect(u);const response=await request(u,'/welcome',submission);redirect(response,'/dashboard');assert.equal(response.cookie,null);assert.deepEqual((await session(u.id)).welcome,{isComplete:true});redirect(await request(u),'/dashboard');
});
test('invalid schema corpus never contacts upstream',async()=>{
  const u=await user();const before=(await command('report')).observed.length;
  const entry={questionId:5,queryKey:'cuisines',answers:[]};
  const invalid=[null,[],{}, {submission:null},{submission:{}},{submission:[null]},...['5',null,true].map(questionId=>({submission:[{...entry,questionId}]})),...['unknown',null,5].map(queryKey=>({submission:[{...entry,queryKey}]})),...['x',{},null,[null],['x'],[{name:null}],[{value:2}],[{code:[]}]].map(answers=>({submission:[{...entry,answers}]}))];
  for(const body of invalid)failure(await request(u,'/welcome',body),'Some answers look invalid. Please review them.');
  failure(await request(u,'/welcome','{',true),'Some answers look invalid. Please review them.');
  assert.equal((await command('report')).observed.length,before);assert.deepEqual((await session(u.id)).welcome,{isComplete:false});
});
test('Zod stripping preserves fractional and unknown ids, optional empty objects and all six queryKeys',async()=>{
  const u=await user();const clean={submission:['cuisines','icd10cm','conditions','price','allergies','diets'].map((queryKey,i)=>({questionId:i-0.5,queryKey,answers:[{},{name:'',value:'',code:''}]}))};
  const body={extra:true,submission:clean.submission.map(x=>({...x,extra:1,answers:x.answers.map(a=>({...a,unexpected:'stripped'}))}))};
  await expect(u,{body:clean});redirect(await request(u,'/welcome',body),'/dashboard');
});
test('empty submission is valid without invented required questions',async()=>{const u=await user();await expect(u,{body:{submission:[]}});redirect(await request(u,'/welcome',{submission:[]}),'/dashboard');});
for(const status of [400,401,403,422,503])test(`backend${status} preserves incomplete state`,async()=>{const u=await user();await expect(u,{status,response:{detail:'local failure'}});failure(await request(u,'/welcome',submission));assert.deepEqual((await session(u.id)).welcome,{isComplete:false});});
test('real20second save timeout aborts upstream and preserves incomplete state',{timeout:35000},async()=>{
  const u=await user();const before=await command('report');await expect(u,{stall:true});const start=performance.now();failure(await request(u,'/welcome',submission));const elapsed=performance.now()-start;assert.ok(elapsed>=19000&&elapsed<29000,`actual20s deadline ${elapsed}`);assert.deepEqual((await session(u.id)).welcome,{isComplete:false});
  let report;const deadline=performance.now()+2000;do{report=await command('report');if(report.aborted.length>before.aborted.length)break;await new Promise(ok=>setTimeout(ok,20));}while(performance.now()<deadline);assert.equal(report.aborted.length,before.aborted.length+1);
});
test('empty profile to welcome to saved dashboard roundtrip renders chips and clears completion',async()=>{
  const u=await user();delete u.data.welcome;await jsonRequest('/_spike/session',{id:u.id,data:u.data},'PUT');
  await expect(u,{method:'GET',path:'/backend/user/profile',body:undefined,response:{attributes:[],diets:[]}});redirect(await request(u,'/dashboard'),'/welcome');
  const page=await request(u);assert.equal(page.status,200);assert.match(page.text,/Tell us about you/);
  await expect(u);redirect(await request(u,'/welcome',submission),'/dashboard');
  await expect(u,{method:'GET',path:'/backend/user/profile',body:undefined,response:{attributes:[{attribute_category:'condition',attribute_name:'Local no dairy'}],diets:[{diet_type:{diet_name:'Mediterranean'}}]}});
  const dashboard=await request(u,'/dashboard');assert.equal(dashboard.status,200);assert.match(dashboard.text,/Mediterranean/);assert.match(dashboard.text,/Local no dairy/);assert.equal((await session(u.id)).welcome,undefined);
});
test('logout overlapping an actual pending save cannot resurrect retired session or cookie',async()=>{
  const u=await user();await expect(u,{delay:1500});let settled=false;const pending=request(u,'/welcome',submission).finally(()=>{settled=true;});
  try{const deadline=performance.now()+1000;let started=false;do{const report=await command('report');started=report.observed.some(c=>c.user===u.row.public_id&&c.path==='/backend/welcome');if(started)break;await new Promise(ok=>setTimeout(ok,20));}while(performance.now()<deadline);assert.ok(started);
    await logout(u.cookie);assert.equal(await session(u.id),null);assert.equal(settled,false);const response=await pending;redirect(response,'/login');assert.equal(response.cookie,null);assert.equal(await session(u.id),null);
  }finally{await pending;}
});
test('enhanced submit returns redirect metadata without fetching dashboard',async()=>{
  const u=await user();await expect(u);const response=await fetch(`${base}/welcome`,{method:'POST',headers:{origin:base,cookie:`__session=${u.cookie}`,'content-type':'application/json','x-requested-with':'XMLHttpRequest'},body:JSON.stringify(submission),redirect:'manual'});assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true,redirect:'/dashboard'});assert.equal(response.headers.get('set-cookie'),null);
});
test('enhanced unauthenticated malformed submit returns login redirect metadata before validation',async()=>{
  const before=(await command('report')).observed.length;
  const response=await fetch(`${base}/welcome`,{method:'POST',headers:{origin:base,'content-type':'application/json','x-requested-with':'XMLHttpRequest'},body:'{',redirect:'manual'});assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:false,redirect:'/login'});assert.equal((await command('report')).observed.length,before);
});
test('network disconnect is the same explicit save failure, never completed',async()=>{
  const u=await user();await expect(u,{disconnect:true});failure(await request(u,'/welcome',submission));assert.deepEqual((await session(u.id)).welcome,{isComplete:false});
});
