const {chromium}=require(process.env.WAVE4B_PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');const assert=require('node:assert/strict');
// Reuse the public synthetic unit-test example; never embed full IBAN in QA evidence.
const validIban=fs.readFileSync('src/test/iban.test.ts','utf8').match(/"DE[0-9]{20}"/)[0].slice(1,-1);
(async()=>{
 const b=await chromium.launch({executablePath:process.env.WAVE4B_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 const c=await b.newContext({reducedMotion:'reduce'});await c.addCookies([{name:'tarifbutler_cookie_consent',value:'qa-essential-only',domain:'127.0.0.1',path:'/'}]);
 const p=await c.newPage();let errors=[];p.on('pageerror',e=>errors.push(e.message));
 const profile={id:'qa',firstName:'QA',lastName:'Beispiel',status:'active',languageCode:'de',memberSince:'2026-01-01'};
 const rows=['recommended','closed','confirmed'].map((status,i)=>({id:'qa-'+i,status,attributedAt:'2026-01-02',tariffRecommendedAt:null,closedAt:null,confirmedAt:null}));
 let requests=[];
 await p.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1')return r.abort();if(!u.pathname.startsWith('/api/'))return r.continue();const a=u.pathname.slice(5);requests.push({path:a,method:r.request().method()});assert(!r.request().postData()?.includes('3704'),'IBAN request');if(a==='affiliate/profile/bootstrap')return r.fulfill({status:204});const data={'auth/session':{authenticated:true,user:{id:'qa',name:'QA',image:null,emailVerified:true}},'affiliate/profile':profile,'affiliate/payouts':[{id:'qa-pay',amount:30,currency:'EUR',status:'failed',paidAt:null,createdAt:'2026-01-01'}],'affiliate/payout-method':{id:'qa-bank',method:'bank_transfer',status:'unknown',maskedIban:'DE** **** **** **** **30 00',updatedAt:''},'affiliate/referrals':rows,'affiliate/rewards':[{id:'qa-reward',referralId:'qa',status:'available',method:'gift_card',amount:30,currency:'EUR',voucherLabel:null,paidAt:null,availableAt:'2026-01-01'}]}[a];assert(data!==undefined,'Unexpected API action '+a);return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});});
 const out='docs/qa/wave4b-tb02',checks=[],images=[];fs.mkdirSync(out,{recursive:true});
 async function settled(){await p.evaluate(async()=>{await Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})));});}
 async function shot(name){await settled();await p.screenshot({path:out+'/'+name+'.png',fullPage:true,mask:[p.getByRole('dialog').locator('input')],maskColor:'#d9dde3'});images.push(name);}
 async function geom(tag,after=true){await settled();const g=await p.getByRole('dialog').evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return{opacity:s.opacity,animation:s.animationName,width:r.width,left:r.left,right:r.right,top:r.top,bottom:r.bottom,radii:[s.borderTopLeftRadius,s.borderTopRightRadius,s.borderBottomLeftRadius,s.borderBottomRightRadius],scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,viewport:[innerWidth,innerHeight]};});if(after){assert.equal(g.opacity,'1');assert.equal(g.animation,'none');assert(g.width<=512.1);assert(g.width<=g.viewport[0]-31);assert(g.radii.every(v=>v==='24px'));assert(g.top>=15&&g.bottom<=g.viewport[1]-15);assert(g.scrollWidth<=g.clientWidth);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}checks.push({tag,after,...g});return g;}
 async function reachable(){const dialog=p.getByRole('dialog');for(const e of await dialog.locator('h2,p,input,button').all()){if(!await e.isVisible())continue;await e.scrollIntoViewIfNeeded();const g=await e.evaluate(el=>{const r=el.getBoundingClientRect(),d=el.closest('[role="dialog"]').getBoundingClientRect();let ranges=[];for(const n of el.childNodes){if(n.nodeType===Node.TEXT_NODE&&n.textContent.trim()){const range=document.createRange();range.selectNodeContents(n);ranges.push(...[...range.getClientRects()].map(r=>({left:r.left,right:r.right})));}}return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,dl:d.left,dr:d.right,dt:d.top,db:d.bottom,scroll:el.scrollWidth,client:el.clientWidth,ranges};});assert(g.left>=g.dl+1&&g.right<=g.dr-1);assert(g.top>=g.dt-1&&g.bottom<=g.db+1);assert(g.scroll<=g.client+1);assert(g.ranges.every(r=>r.left>=g.dl+1&&r.right<=g.dr-1));}}
 for(const phase of ['before','after'])for(const width of [320,375,390,428,760,1024,1440]){
  await p.setViewportSize({width,height:900});const port=phase==='before'?8091:8090;
  await p.goto(`http://127.0.0.1:${port}/empfehlungsprogramm/profil`);await p.getByText('Konto & Profil',{exact:true}).waitFor();
  if(phase==='after'){
   const badge=p.getByRole('table',{name:'Auszahlungen'}).getByText('Nicht abgeschlossen',{exact:true});const g=await badge.evaluate(e=>({nowrap:getComputedStyle(e).whiteSpace,width:e.getBoundingClientRect().width,parent:e.parentElement.getBoundingClientRect().width,height:e.getBoundingClientRect().height}));assert.equal(g.nowrap,'nowrap');assert(g.width<=g.parent+1);assert(g.height<40);
  }
  if([390,1440].includes(width))await shot(phase+'-payouts-'+width);
  for(const [kind,triggerName] of [['bank','Bankverbindung ändern'],['profile','Kontodaten ändern']]){
   const trigger=p.getByRole('button',{name:triggerName,exact:true});await trigger.click();await p.getByRole('dialog').waitFor();await geom(phase+'-'+kind+'-'+width,phase==='after');
   if([390,1440].includes(width))await shot(phase+'-'+kind+'-'+width);
   if(phase==='after'){
    await reachable();const save=p.getByRole('button',{name:'Speichern',exact:true});assert(await save.isDisabled());const style=await save.evaluate(e=>({opacity:getComputedStyle(e).opacity,bg:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color}));assert.equal(style.opacity,'1');assert.equal(style.bg,'rgb(241, 245, 249)');
    await p.getByRole('dialog').evaluate(e=>e.scrollTop=0);
    if(kind==='bank'){
     await p.getByLabel('Kontoinhaber',{exact:true}).fill('QA Beispiel');await p.getByLabel('IBAN',{exact:true}).fill(validIban);assert(!((await p.getByLabel('IBAN',{exact:true}).getAttribute('value'))||'').includes('3704'));
     await p.getByLabel('IBAN',{exact:true}).blur();assert.equal(await p.getByLabel('IBAN',{exact:true}).count(),0);await p.waitForFunction(()=>document.activeElement?.textContent==='IBAN erneut eingeben');assert(await p.getByRole('button',{name:'Format prüfen',exact:true}).isDisabled());assert(!(await p.locator('body').innerHTML()).includes('3704'));if([390,1440].includes(width))await shot('after-masked-'+width);
     await p.getByRole('button',{name:'IBAN erneut eingeben',exact:true}).click();await p.waitForFunction(()=>document.activeElement===Array.from(document.querySelectorAll('[role=dialog] label')).find(e=>e.textContent.startsWith('IBAN'))?.querySelector('input'));assert.equal(await p.getByLabel('IBAN',{exact:true}).inputValue(),'');await p.getByLabel('IBAN',{exact:true}).fill('DE89');assert(await p.getByRole('button',{name:'Format prüfen',exact:true}).isEnabled());
    }
    await p.getByRole('dialog').evaluate(e=>e.scrollTop=0);
    await p.getByRole('dialog').locator('input').first().focus();
    for(let i=0;i<10;i++){await p.keyboard.press('Tab');assert(await p.evaluate(()=>!!document.activeElement.closest('[role="dialog"]')),phase+' '+kind+' '+width+' focus cycle '+i);}
    await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'detached'});assert(await trigger.evaluate(e=>e===document.activeElement));
    await trigger.click();await p.getByRole('dialog').waitFor();await p.mouse.click(4,4);await p.getByRole('dialog').waitFor({state:'detached'});
    await trigger.click();await p.getByRole('dialog').getByRole('button',{name:'Close',exact:true}).click();await p.getByRole('dialog').waitFor({state:'detached'});
   }else{await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'detached'});}
  }
  await p.goto(`http://127.0.0.1:${port}/empfehlungsprogramm/empfehlungen`);await p.getByRole('table',{name:'Empfehlungen'}).waitFor();
  if(phase==='after'){assert.equal(await p.getByText('02.01.2026',{exact:true}).count(),3);assert.equal(await p.getByText(/Empfehlung vom/).count(),0);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  if([390,1440].includes(width))await shot(phase+'-referrals-'+width);
  await p.goto(`http://127.0.0.1:${port}/empfehlungsprogramm/belohnungen`);await p.getByText('Verfügbar',{exact:true}).waitFor();assert.equal(await p.getByText('Gutschein ausgegeben',{exact:true}).count(),0);
 }
 await p.setViewportSize({width:320,height:360});await p.goto('http://127.0.0.1:8090/empfehlungsprogramm/profil');await p.getByText('Konto & Profil',{exact:true}).waitFor();
 for(const [kind,name] of [['bank','Bankverbindung ändern'],['profile','Kontodaten ändern']]){await p.getByRole('button',{name,exact:true}).click();const g=await geom('after-short-'+kind);assert(g.scrollHeight>g.clientHeight);await reachable();await p.getByRole('dialog').evaluate(e=>e.scrollTop=0);await shot('after-short-'+kind);await p.keyboard.press('Escape');await p.getByRole('dialog').waitFor({state:'detached'});}
 assert.equal(errors.length,0);assert(requests.every(r=>r.method==='GET'||r.path==='affiliate/profile/bootstrap'));
 fs.writeFileSync(out+'/results.json',JSON.stringify({base:'f425147ea6ff05c3a240e992e2e0146ac1f0737c',baseTree:'f8422dc3e27209800b8b7e8a9cd2edc7848a7bbb',fixtureOnly:true,logo:'EVIDENCE REQUIRED: external assets blocked in synthetic QA; not evidence of broken production logo',checks,images,errors,interactionAssertions:['text/input/button reachability','fixed width and radius','no horizontal overflow','save disabled and gray','format check disabled after masking/re-enabled after replacement','no raw IBAN attribute/request/summary','focus trap and return','Escape/backdrop/Close','short viewport scroll','referral date appears only in date column','single-line payout badges','reward available is not fulfilled']},null,2));
 fs.writeFileSync(out+'/gallery.html','<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>TB02 synthetische QA</title><style>body{font:16px system-ui;margin:20px}img{max-width:100%;height:auto;border:1px solid #ddd}section{margin:24px 0}</style><h1>TB02 – Before / After</h1><p>Synthetische Daten; Dialog-Eingaben maskiert. Externes Logo hier blockiert, echte Preview: EVIDENCE REQUIRED.</p>'+images.map(n=>`<section><h2>${n}</h2><a href="${n}.png"><img loading="lazy" src="${n}.png" alt="${n}"></a></section>`).join(''));
 console.log(JSON.stringify({modalMeasurements:checks.length,images:images.length,errors}));await b.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
