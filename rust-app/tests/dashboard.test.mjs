import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import { base, seedFixture, login, cookieValue, session, logout, jsonRequest, jwt, jwtSecret } from './auth-fixtures.mjs';
const control = process.env.FOOD4U_MOCK_CONTROL_URL;
assert.ok(control, 'Run through dashboard-mock.mjs'); assert.equal(new URL(control).hostname,'127.0.0.1');
const cookies = [];
async function command(path,body) {
  const res = await fetch(new URL(path,control),{method:body?'POST':'GET',headers:body?{'content-type':'application/json'}:{},...(body?{body:JSON.stringify(body)}:{})});
  assert.equal(res.status,200); return res.json();
}
async function user({expired=false,welcome,missing=false}={}) {
  const fixture = await seedFixture(); const cookie = cookieValue(await login(fixture)); cookies.push(cookie);
  const id = cookie.slice(0,cookie.lastIndexOf('.')); const data = await session(id);
  if (expired) data.token = await jwt.sign({user_id:fixture.row.public_id,username:fixture.row.username,role:fixture.row.user_role,exp:1700000000},jwtSecret);
  if (welcome !== undefined) data.welcome = welcome;
  if (missing) data.auth.id = -2147483647;
  await jsonRequest('/_spike/session',{id,data},'PUT');
  await command('token',{publicId:fixture.row.public_id,username:fixture.row.username,role:fixture.row.user_role,token:data.token});
  return {...fixture,cookie,id,data};
}
const expect = (u,rest={}) => command('expect',{user:u.row.public_id,method:'GET',path:'/backend/user/profile',...rest});
async function dashboard(u) {
  const res = await fetch(`${base}/dashboard`,{headers:{cookie:`__session=${u.cookie}`},redirect:'manual',signal:AbortSignal.timeout(30000)});
  return {status:res.status,location:res.headers.get('location'),setCookie:res.headers.get('set-cookie'),html:await res.text()};
}
function alert(page,status) { assert.equal(page.status,200); assert.match(page.html,/role="alert"/); assert.match(page.html,/The food service isn(?:&#39;|&apos;|')t responding/); if(status) assert.match(page.html,new RegExp(`HTTP ${status}`)); assert.doesNotMatch(page.html,/What should I eat\?/); }
afterEach(async()=>{ for(const cookie of cookies.splice(0)) await logout(cookie); const report=await command('report'); assert.deepEqual(report.violations,[]); assert.deepEqual(report.pending,[]); });
test('dashboard backend500 is an explicit alert, not missing profile or onboarding',async()=>{
  const u=await user(); await expect(u,{status:500,response:{detail:'local outage'}});
  alert(await dashboard(u),500); assert.equal((await session(u.id)).welcome,undefined);
});

const answers = {attributes:[],diets:[{diet_type:{diet_name:'Local Mediterranean'}}]};
function ask(page) { assert.equal(page.status,200); assert.match(page.html,/What should I eat\?/); assert.doesNotMatch(page.html,/The food service isn(?:&#39;|&apos;|')t responding/); }
function redirect(page,path) { assert.equal(page.status,303); assert.equal(new URL(page.location,base).pathname,path); }
const ensure = (u,rest={}) => expect(u,{method:'POST',path:'/backend/profile',body:null,response:{id:7,public_id:u.row.public_id},...rest});
async function persistedRefresh(u) { const data=await session(u.id); await command('persisted',{user:u.row.public_id,token:data.token}); assert.deepEqual(data.auth,u.data.auth); }

test('welcome incomplete redirects before any backend request and retains the draft',async()=>{
  const welcome={isComplete:false,step:'review',draft:{diet:'Local draft'}};
  const u=await user({welcome}); const before=await command('report');
  redirect(await dashboard(u),'/welcome'); assert.deepEqual((await session(u.id)).welcome,welcome);
  assert.equal((await command('report')).observed.length,before.observed.length);
});

test('profile answers render diets then medical history then legacy deduplicated chips capped at eight',async()=>{
  const u=await user({welcome:{isComplete:true,step:'review'}});
  const attributes=[
    ['unrelated','Invisible unrelated'],['cuisine','Italian'],['budget','12.50'],['CONDITION','Local diabetes'],['allergen','Local peanut'],
    ['food restriction','Local sodium'],['ICD10CM','Local E11'],['preconditions','Local arthritis'],
    ['allergy','Local peanut'],['restriction','Local sesame'],['condition','Local ninth'],['condition',''],
  ].map(([attribute_category,attribute_name])=>({attribute_category,attribute_name}));
  await expect(u,{response:{attributes,medical_history:[{icd_details:{code:'J30.9',description:'Allergic rhinitis, unspecified'}},{icd_details:{code:'J30.9',description:'Allergic rhinitis, unspecified'}},{icd_details:{code:'I10',description:''}},{icd_details:{code:'E11'}},{icd_details:{}},{}],diets:[{diet_type:{diet_name:'Local Mediterranean'}},{diet_type:{diet_name:'Local Keto'}},{diet_type:{diet_name:'Local Mediterranean'}},{diet_type:{diet_name:''}}]}});
  const page=await dashboard(u); ask(page);
  const region=page.html.match(/<p\b[^>]*aria-label="Your profile"[^>]*>([\s\S]*?)<\/p>/)?.[1];
  assert.ok(region,'Profile chips have a named readable region');
  const chipText=[...region.matchAll(/<span\b[^>]*>([^<]*)<\/span>/g)].map(m=>m[1]).filter(v=>v!=='Your profile:');
  assert.deepEqual(chipText,['Local Mediterranean','Local Keto','Allergic rhinitis, unspecified','I10','E11','Local diabetes','Local peanut','Local sodium']);
  assert.doesNotMatch(region,/Invisible unrelated|Italian|12\.50|Local ninth|Local E11|Local arthritis|Local sesame/); assert.equal((await session(u.id)).welcome,undefined);
});

test('empty profile persists welcome incomplete and the next request short-circuits upstream',async()=>{
  const u=await user(); await expect(u,{response:{attributes:[],diets:[]}});
  redirect(await dashboard(u),'/welcome'); assert.deepEqual((await session(u.id)).welcome,{isComplete:false});
  redirect(await dashboard(u),'/welcome');
});

test('empty profile with completed welcome renders Ask and clears welcome',async()=>{
  const u=await user({welcome:{isComplete:true}}); await expect(u,{response:{attributes:[],diets:[]}});
  const page=await dashboard(u); ask(page); assert.doesNotMatch(page.html,/Your profile:/); assert.equal((await session(u.id)).welcome,undefined);
});

test('expired bearer refreshes from stable D1 identity, retries with a 30minute JWT and persists that exact token',async()=>{
  const u=await user({expired:true}); await expect(u,{status:403,response:{detail:'Token has expired'}});
  await expect(u,{refreshed:true,response:answers}); ask(await dashboard(u)); await persistedRefresh(u);
  await expect(u,{refreshed:true,response:answers}); ask(await dashboard(u));
});

test('expired bearer with no matching D1 row redirects to login without ensure or retry',async()=>{
  const u=await user({expired:true,missing:true}); await expect(u,{status:403,response:{detail:'Token has expired'}});
  redirect(await dashboard(u),'/login');
  assert.ok(await session(u.id) === null,'Failed refresh retires the stale authenticated session');
  const next=await fetch(`${base}/login`,{headers:{cookie:`__session=${u.cookie}`},redirect:'manual'});
  assert.equal(next.status,200,'Following the redirect reaches login, not another dashboard redirect');
  assert.match(await next.text(),/Welcome back/);
});

test('missing backend profile is ensured once with the original bearer then retried',async()=>{
  const u=await user(); await expect(u,{status:403,response:{detail:'User not found'}});
  await ensure(u); await expect(u,{response:answers}); ask(await dashboard(u));
});

test('ensure failure renders unavailable with ensure HTTP status and does not retry',async()=>{
  const u=await user(); await expect(u,{status:403,response:{detail:'User not found'}});
  await ensure(u,{status:503,response:{detail:'local ensure outage'}}); alert(await dashboard(u),503);
  assert.equal((await session(u.id)).welcome,undefined);
});

test('unrecognized403 is unavailable rather than refresh or ensure',async()=>{
  const u=await user(); await expect(u,{status:403,response:{detail:'Access denied'}}); alert(await dashboard(u),403);
});

test('repeated expired response stops after one refresh rather than looping',async()=>{
  const u=await user({expired:true}); await expect(u,{status:403,response:{detail:'Token has expired'}});
  await expect(u,{refreshed:true,status:403,response:{detail:'Token has expired'}});
  alert(await dashboard(u),403); await persistedRefresh(u);
});

test('repeated missing profile stops after one ensure rather than looping',async()=>{
  const u=await user(); await expect(u,{status:403,response:{detail:'User not found'}});
  await ensure(u); await expect(u,{status:403,response:{detail:'User not found'}}); alert(await dashboard(u),403);
});

for (const first of ['refresh','ensure']) test(`${first} followed by the other recovery succeeds within three profile attempts`,async()=>{
  const u=await user({expired:true});
  if(first==='refresh') {
    await expect(u,{status:403,response:{detail:'Token has expired'}});
    await expect(u,{refreshed:true,status:403,response:{detail:'User not found'}});
    await ensure(u,{refreshed:true});
  } else {
    await expect(u,{status:403,response:{detail:'User not found'}}); await ensure(u);
    await expect(u,{status:403,response:{detail:'Token has expired'}});
  }
  await expect(u,{refreshed:true,response:answers}); ask(await dashboard(u)); await persistedRefresh(u);
});

test('profile network disconnect renders unavailable without creating an onboarding draft',async()=>{
  const u=await user(); await expect(u,{disconnect:true}); alert(await dashboard(u)); assert.equal((await session(u.id)).welcome,undefined);
});

test('real20second profile timeout aborts upstream and renders unavailable without onboarding', {timeout:35000},async()=>{
  const u=await user(); const before=await command('report'); await expect(u,{stall:true}); const start=performance.now();
  alert(await dashboard(u)); const elapsed=performance.now()-start;
  assert.ok(elapsed>=19000 && elapsed<29000,`Real 20 second backend deadline, elapsed ${elapsed}ms`);
  assert.equal((await session(u.id)).welcome,undefined);
  const deadline=performance.now()+2000; let report;
  do { report=await command('report'); if(report.aborted.length>before.aborted.length)break; await new Promise(ok=>setTimeout(ok,20)); } while(performance.now()<deadline);
  assert.equal(report.aborted.length,before.aborted.length+1,'Timed out upstream connection is aborted');
});

// Synchronize on the real upstream request, not an assumed worker scheduling delay.
async function startedProfile(u) {
  const deadline=performance.now()+1000;
  do {
    const report=await command('report');
    if(report.observed.some(call=>call.user===u.row.public_id && call.method==='GET' && call.path==='/backend/user/profile'))return;
    await new Promise(ok=>setTimeout(ok,20));
  } while(performance.now()<deadline);
  assert.fail('Dashboard profile request did not reach the mock before the retirement barrier');
}
async function publicLogout(u) {
  const response=await fetch(`${base}/api/auth/logout`,{method:'POST',headers:{origin:base,cookie:`__session=${u.cookie}`},redirect:'manual'});
  assert.equal(response.status,303); await response.text();
  assert.ok(await session(u.id)===null,'Logout deleted the original session before the backend response');
}
async function remainsRetired(u,page) {
  assert.ok(await session(u.id)===null,'In-flight dashboard must not resurrect a retired authenticated KV session');
  assert.ok(page.setCookie===null,'In-flight dashboard must not reissue a retired session cookie');
  redirect(await dashboard(u),'/login');
}

test('logout while profile answers are pending cannot resurrect the session when welcome is cleared',async()=>{
  const u=await user({welcome:{isComplete:true}});
  await expect(u,{response:answers,delay:1500});
  let settled=false; const pending=dashboard(u).finally(()=>{settled=true;});
  try {
    await startedProfile(u); await publicLogout(u);
    assert.ok(!settled,'Logout completed while the dashboard backend request was still pending');
    await remainsRetired(u,await pending);
  } finally { await pending; }
});

test('relogin rotation while profile answers are pending keeps the retired key dead and the new session live',async()=>{
  const u=await user({welcome:{isComplete:true}});
  await expect(u,{response:answers,delay:1500});
  let settled=false; const pending=dashboard(u).finally(()=>{settled=true;});
  try {
    await startedProfile(u);
    const response=await fetch(`${base}/api/login`,{method:'POST',headers:{origin:base,'content-type':'application/json',cookie:`__session=${u.cookie}`},body:JSON.stringify([u.row.username,u.password]),redirect:'manual'});
    assert.equal(response.status,200); assert.equal(await response.json(),'');
    const nextCookie=cookieValue(response); cookies.push(nextCookie);
    assert.ok(nextCookie!==u.cookie,'Relogin rotated the browser session');
    assert.ok(await session(u.id)===null,'Relogin deleted the original key before the backend response');
    assert.ok(!settled,'Relogin completed while the dashboard backend request was still pending');
    await remainsRetired(u,await pending);
    const nextId=nextCookie.slice(0,nextCookie.lastIndexOf('.'));
    assert.ok((await session(nextId))?.auth?.publicId===u.row.public_id,'The replacement session remains authenticated');
    const loginPage=await fetch(`${base}/login`,{headers:{cookie:`__session=${nextCookie}`},redirect:'manual'});
    assert.equal(loginPage.status,303); assert.equal(new URL(loginPage.headers.get('location'),base).pathname,'/dashboard'); await loginPage.text();
  } finally { await pending; }
});

test('logout while expired response is pending cannot resurrect a session during token refresh',async()=>{
  const u=await user({expired:true});
  await expect(u,{status:403,response:{detail:'Token has expired'},delay:1500});
  let settled=false; const pending=dashboard(u).finally(()=>{settled=true;});
  try {
    await startedProfile(u); await publicLogout(u);
    assert.ok(!settled,'Logout completed before the expired-token response arrived');
    await remainsRetired(u,await pending);
  } finally { await pending; }
});


test('medical-only persisted profile renders Ask without returning to welcome',async()=>{
  const u=await user();
  await expect(u,{response:{attributes:[],diets:[],medical_history:[{icd_details:{code:'J30.9',description:'Allergic rhinitis, unspecified'}}]}});
  const page=await dashboard(u); ask(page);
  assert.match(page.html,/Allergic rhinitis, unspecified/);
  assert.equal((await session(u.id)).welcome,undefined);
});
