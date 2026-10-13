// Keyboard-only onboarding against the actual Rust /api/refs and /welcome routes.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchProof, loginUI, command, base, profile } from './dashboard-browser.mjs';
export { launchProof, command, base };
export const questions=['What cuisines do you enjoy?','Do you follow a particular diet?','Do you have a medical condition?','Any allergies or foods you avoid?','What do you usually spend per meal?'];
export async function keyTo(page,locator) {
  for(let i=0;i<60;i++){if(await locator.evaluate(el=>el===document.activeElement))return;await page.keyboard.press('Tab');}
  assert.fail('Keyboard Tab did not reach requested control');
}
export async function activate(page,name){const control=page.getByRole('button',{name,exact:true});await keyTo(page,control);await page.keyboard.press('Enter');}
export async function welcomeLogin(page){const user=await loginUI(page);await page.goto(`${base}/welcome`);await page.getByRole('heading',{name:'Tell us about you',exact:true}).waitFor();return user;}
export async function refs(page,user,index,query,items,{debounce=false}={}){
  const type=['cuisines','diets','icd10cm','conditions'][index];
  const path=index<2?'/backend/refs?queryKey=diets':`/clinical/conditions/v3/search?terms=${encodeURIComponent(query)}&maxList=10&ef=icd10cm`;
  await command('expect',{user:user.row.public_id,method:'GET',path,response:index<2?items.map(a=>({diet_name:a.name})): [items.length,[],{icd10cm:items.map(a=>[{code:a.code??'',name:a.name}])}]});
  const trigger=page.getByRole('combobox',{name:questions[index],exact:true});await keyTo(page,trigger);await page.keyboard.press('Enter');
  const input=page.getByLabel('Type to search',{exact:true});await input.waitFor();assert.ok(await input.evaluate(el=>el===document.activeElement),'Search receives keyboard focus');
  const before=(await command('report')).observed.length;
  await page.keyboard.type(` ${query} `,{delay:1});
  if(debounce){await page.waitForTimeout(120);assert.equal((await command('report')).observed.length,before,'No upstream before300ms debounce');}
  await page.getByRole('option').first().waitFor();
  return {trigger,input};
}
export async function chooseFirst(page){await page.keyboard.press('ArrowUp');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');}
export async function closeRefs(page,trigger){await page.keyboard.press('Escape');assert.ok(await trigger.evaluate(el=>el===document.activeElement),'Escape restores combobox focus');}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const proof=await launchProof('welcome-browser');let failure;
 try{
  const context=await proof.contextFor({viewport:{width:1440,height:900}});const page=await context.newPage();const user=await welcomeLogin(page);
  const seen=[];page.on('request',r=>{if(new URL(r.url()).pathname==='/api/refs')seen.push(new URL(r.url()).searchParams.get('type'));});
  proof.check('step1 zero progress and disabled Back',await page.getByRole('progressbar',{name:'Onboarding progress'}).getAttribute('aria-valuenow')==='0'&&await page.getByRole('button',{name:'Back',exact:true}).isDisabled());
  let search=await refs(page,user,0,'Italian',[{name:'Italian'}],{debounce:true});await chooseFirst(page);
  proof.check('selected option announced',await page.getByRole('option').first().textContent().then(s=>s.includes('selected')));await closeRefs(page,search.trigger);
  await activate(page,'Remove Italian');proof.check('keyboard removes selected chip',await page.getByRole('button',{name:'Remove Italian',exact:true}).count()===0);
  // Reopen retains the fetched result; selection toggles without a synthetic API fixture.
  await keyTo(page,search.trigger);await page.keyboard.press('Enter');await chooseFirst(page);await closeRefs(page,search.trigger);
  await activate(page,'Continue');search=await refs(page,user,1,'Mediterranean',[{name:'Mediterranean'}]);await chooseFirst(page);await closeRefs(page,search.trigger);await activate(page,'Continue');
  search=await refs(page,user,2,'Crohn',[{name:"Crohn's disease",code:'K50.9'}]);await chooseFirst(page);await closeRefs(page,search.trigger);await activate(page,'Continue');
  search=await refs(page,user,3,'Lactose',[{name:'Lactose intolerance',code:'E73.9'}]);await chooseFirst(page);await closeRefs(page,search.trigger);await activate(page,'Continue');
  const price=page.getByPlaceholder('Enter price');await keyTo(page,price);await page.keyboard.type('12.50');await activate(page,'Back');proof.check('answers retained across Back',await page.getByRole('button',{name:'Remove Lactose intolerance (E73.9)',exact:true}).isVisible());await activate(page,'Continue');proof.check('price retained',await price.inputValue()==='12.50');await activate(page,'Review');
  await page.getByRole('heading',{name:"Here's what we'll check against",exact:true}).waitFor();
  proof.check('all five questions visible on review',(await Promise.all(questions.map(name=>page.getByRole('heading',{name,exact:true}).isVisible()))).every(Boolean));
  proof.check('review100percent',await page.getByRole('progressbar').getAttribute('aria-valuenow')==='100');
  const body={submission:[{questionId:5,queryKey:'cuisines',answers:[{name:'Italian'}]},{questionId:5555,queryKey:'diets',answers:[{name:'Mediterranean'}]},{questionId:1,queryKey:'icd10cm',answers:[{name:"Crohn's disease",code:'K50.9'}]},{questionId:11,queryKey:'conditions',answers:[{name:'Lactose intolerance',code:'E73.9'}]},{questionId:555,queryKey:'price',answers:[{value:'12.50'}]}]};
  await page.reload();await page.getByRole('heading',{name:"Here's what we'll check against",exact:true}).waitFor();proof.check('review hydrated from localStorage',await page.getByText('12.50',{exact:true}).isVisible());
  await command('expect',{user:user.row.public_id,method:'POST',path:'/backend/welcome',body,status:503,response:{detail:'local outage'},delay:500});await activate(page,'Save profile');
  await page.getByRole('button',{name:'Saving…',exact:true}).waitFor();proof.check('saving is disabled and busy',await page.getByRole('button',{name:'Saving…',exact:true}).isDisabled());
  await page.getByRole('alert').filter({hasText:"Couldn't save your profile. Please try again."}).waitFor();proof.check('failure stays on review retaining answers',new URL(page.url()).pathname==='/welcome'&&await page.getByText('12.50',{exact:true}).isVisible());
  await command('expect',{user:user.row.public_id,method:'POST',path:'/backend/welcome',body,response:{ok:true}});await command('expect',{user:user.row.public_id,method:'GET',path:'/backend/user/profile',response:profile});await activate(page,'Save profile');await page.waitForURL(`${base}/dashboard`);await page.getByRole('heading',{name:'What should I eat?',exact:true}).waitFor();
  proof.check('successful save clears local draft',await page.evaluate(()=>localStorage.getItem('formState')===null));proof.check('actual refs preserve all four odd type mappings',JSON.stringify(seen)===JSON.stringify(['cuisines','diets','icd10cm','conditions']));
  await context.close();
  // Public reload seam: damaged saved drafts must remain recoverable, not silently replaced.
  for(const [kind,raw] of [['corrupt','{"currentStep":'],['schema-invalid',JSON.stringify({currentStep:'three',answers:[{questionId:11,answers:'not an array'}]})]]){
   const storedContext=await proof.contextFor();const storedPage=await storedContext.newPage();await welcomeLogin(storedPage);
   await storedPage.evaluate(raw=>localStorage.setItem('formState',raw),raw);await storedPage.reload();
   await storedPage.getByRole('alert').filter({hasText:/saved|draft|storage|persist|answer/i}).waitFor({timeout:5000});
   proof.check(`${kind} draft warning is visible`,await storedPage.getByRole('heading',{name:'Tell us about you',exact:true}).isVisible());
   proof.check(`${kind} draft retained byte-for-byte`,await storedPage.evaluate(()=>localStorage.getItem('formState'))===raw);
   await activate(storedPage,'Continue');
   proof.check(`${kind} draft not overwritten by fallback navigation`,await storedPage.evaluate(()=>localStorage.getItem('formState'))===raw);
   await storedContext.close();
  }
  for(const method of ['getItem','setItem']){
   const blockedContext=await proof.contextFor();await blockedContext.addInitScript(method=>{const original=Storage.prototype[method];Storage.prototype[method]=function(key,...rest){if(key==='formState')throw new DOMException('Local storage is blocked for fixture','SecurityError');return original.call(this,key,...rest);};},method);
   const blockedPage=await blockedContext.newPage();await welcomeLogin(blockedPage);await activate(blockedPage,'Continue');
   await blockedPage.getByRole('alert').filter({hasText:/saved|draft|storage|persist|answer/i}).waitFor({timeout:5000});
   proof.check(`${method} blocked warns while onboarding remains usable`,await blockedPage.getByRole('combobox',{name:questions[1],exact:true}).isVisible());await blockedContext.close();
  }
 }catch(error){failure=error;}await proof.finish(failure);
}
