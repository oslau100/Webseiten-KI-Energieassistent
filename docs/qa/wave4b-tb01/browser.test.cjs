const { chromium } = require(process.env.WAVE4B_PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs');
const path = require('path');
(async () => {
 fs.mkdirSync('work', {recursive:true});
 fs.writeFileSync('work/no-reward.html', '<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Synthetische QA: Ohne Belohnung</title><div id="root"></div><script type="module" src="/src/test/fixtures/noReward.tsx"></script></html>');
 const browser = await chromium.launch({executablePath:process.env.WAVE4B_CHROMIUM || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context = await browser.newContext({reducedMotion:'reduce'});
 await context.addCookies([{name:'tarifbutler_cookie_consent',value:encodeURIComponent(JSON.stringify({essential:true,marketing:false})),domain:'127.0.0.1',path:'/'}]);
 const page = await context.newPage();
 let mode='bank', empty=false, delay=0, fail=false;
 const profile={id:'qa-profile',firstName:'QA',lastName:'Beispiel',languageCode:'de',status:'active',memberSince:'2026-01-01'};
 const referrals=['recommended','closed','confirmed','unknown_internal'].map((status,i)=>({id:`qa-ref-${i}`,status,attributedAt:i===3?null:'2026-01-02',tariffRecommendedAt:null,closedAt:null,confirmedAt:null}));
 const rewards=['pending','available','paid','unknown_internal'].map((status,i)=>({id:`qa-reward-${i}`,referralId:'qa-ref',status,method:i===2?'gift_card':'bank_transfer',amount:30,currency:'EUR',voucherLabel:null,availableAt:status==='available'?'2026-02-01':null,paidAt:status==='paid'?'2026-02-02':null}));
 const payouts=['pending','processing','paid','failed','cancelled','unknown_internal'].map((status,i)=>({id:`qa-pay-${i}`,status,amount:30,currency:'EUR',paidAt:status==='paid'?'2026-02-03':null,createdAt:'2026-01-01'}));
 const requests=[]; const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(!['127.0.0.1','localhost'].includes(url.hostname)) return route.abort();
  if(!url.pathname.startsWith('/api/')) return route.continue();
  const api=url.pathname.slice(5); requests.push({api,method:route.request().method()});
  if(delay) await new Promise(r=>setTimeout(r,delay));
  if(fail && api==='affiliate/profile') return route.fulfill({status:503,body:'Unavailable'});
  const data={ 'auth/session':{authenticated:true,user:{id:'qa-user',name:'QA Beispiel',image:null,emailVerified:true}},
   'affiliate/overview':{profile,program:{},defaultLink:{},totals:{referrals:4,availableRewards:1,paidRewards:1},referralUrl:'https://example.test/?ref=qa'},
   'affiliate/referrals':empty?[]:referrals,'affiliate/rewards':empty?[]:rewards,
   'affiliate/profile':profile,'affiliate/payouts':empty?[]:payouts,
   'affiliate/payout-method':mode==='absent'?null:{id:'qa-method',method:mode==='voucher'?'gift_card':mode==='unknown'?'unknown_method':'bank_transfer',status:'unknown',maskedIban:mode==='bank'?'DE** **** **** **** **30 00':null,updatedAt:'2026-01-01'} }[api];
  if(api==='affiliate/profile/bootstrap') return route.fulfill({status:204});
  if(data===undefined) throw new Error('Unexpected API action: '+api);
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
 });
 const out='docs/qa/wave4b-tb01'; const results=[]; const gallery=[];
 async function ready(){await page.locator('[aria-busy="false"]').waitFor();}
 async function overflow(label){const result=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,dialogs:[...document.querySelectorAll('[role="dialog"]')].map(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,scroll:el.scrollWidth,client:el.clientWidth}})})); if(result.scroll>result.width+1 || result.dialogs.some(d=>d.left<0||d.right>result.width+1||d.top<0||d.scroll>d.client+1)) throw new Error('Overflow '+label+' '+JSON.stringify(result)); results.push({label,...result});}
 async function shot(name){await page.screenshot({path:path.join(out,name+'.png'),fullPage:true,mask:[page.getByRole('dialog').locator('input')],maskColor:'#d9dde3'});gallery.push(name);}
 // All seven required widths, all four sections and both dialogs.
 for(const width of [320,375,390,428,760,1024,1440]){
  await page.setViewportSize({width,height:width<760?844:1000});
  mode='bank';empty=false;
  for(const section of ['portal','empfehlungen','belohnungen','profil']){
   await page.goto('http://127.0.0.1:8080/empfehlungsprogramm/'+section);await ready();await overflow(section+'-'+width);
   if([390,1440].includes(width)) await shot(section+'-'+width);
  }
  await page.getByRole('button',{name:'Bankverbindung ändern',exact:true}).click();
  await page.getByRole('dialog').waitFor();await overflow('bank-dialog-'+width);
  if([390,1440].includes(width)){
   await shot('bank-empty-'+width);
   await page.getByLabel('Kontoinhaber',{exact:true}).fill('QA Beispiel');
   await page.getByLabel('IBAN',{exact:true}).fill('DE88');
   await shot('bank-incomplete-'+width);
   await page.getByLabel('IBAN',{exact:true}).fill('DE88370400440532013000');
   await shot('bank-invalid-'+width);
   await page.getByLabel('IBAN',{exact:true}).fill('DE89370400440532013000');
   await shot('bank-valid-format-redacted-'+width);
   await page.getByRole('button',{name:'Format prüfen',exact:true}).click();
   await page.getByText('DE •••• •••• 3000',{exact:true}).last().waitFor();
   if(await page.getByLabel('IBAN',{exact:true}).count()) throw new Error('Raw edit field retained');
   await shot('bank-masked-save-disabled-'+width);
   if(await page.getByRole('button',{name:'Speichern',exact:true}).isEnabled())throw new Error('Save enabled');
  }
  await page.getByRole('button',{name:'Abbrechen',exact:true}).click();
  await page.getByRole('button',{name:'Kontodaten ändern',exact:true}).click();await overflow('profile-dialog-'+width);
  if([390,1440].includes(width)) await shot('profile-edit-'+width);
  await page.getByRole('button',{name:'Abbrechen',exact:true}).click();
 }
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:width===390?844:1000});
  for(const variant of ['voucher','unknown','absent','bank-empty']){
   mode=variant;await page.goto('http://127.0.0.1:8080/empfehlungsprogramm/profil');await ready();await overflow(variant+'-'+width);await shot('settings-'+variant+'-'+width);
  }
  empty=true;
  for(const section of ['empfehlungen','belohnungen','profil']){await page.goto('http://127.0.0.1:8080/empfehlungsprogramm/'+section);await ready();await shot('empty-'+section+'-'+width);}
  empty=false; mode='bank';fail=true;
  await page.goto('http://127.0.0.1:8080/empfehlungsprogramm/profil');await page.getByRole('alert').waitFor();await shot('read-error-'+width);fail=false;
  delay=500;await page.goto('http://127.0.0.1:8080/empfehlungsprogramm/empfehlungen');await page.getByRole('status',{name:'Inhalte werden geladen'}).waitFor();await shot('initial-loading-'+width);await ready();delay=0;
 }
 for(const width of [390,1440]) { await page.setViewportSize({width,height:width===390?844:1000}); await page.goto('http://127.0.0.1:8080/work/no-reward.html'); await page.getByText('Ohne Belohnung',{exact:true}).waitFor(); await overflow('isolated-no-reward-'+width); await shot('isolated-no-reward-'+width); }
 // Compare original shell/populated lists/loading to this worktree under identical fixtures.
 await page.setViewportSize({width:1440,height:1000});
 for(const section of ['empfehlungen','belohnungen','profil']){
  await page.goto('http://127.0.0.1:8081/empfehlungsprogramm/'+section);await page.getByRole('heading',{name:section==='profil'?'Einstellungen':section==='empfehlungen'?'Deine Empfehlungen':'Deine Belohnungen',exact:true}).waitFor();await shot('before-'+section+'-1440');
 }
 delay=500;await page.goto('http://127.0.0.1:8081/empfehlungsprogramm/portal');await page.getByText('Portal wird geladen …',{exact:true}).waitFor();await shot('before-loading-1440');delay=0;
 await page.goto('http://127.0.0.1:8080/empfehlungsprogramm/portal');await ready();
 // Sample revisit latency with deterministic 150ms fixture transport; no cache claimed.
 delay=150;const timings=[];
 for(const section of ['Empfehlungen','Belohnungen','Übersicht','Empfehlungen']){
  const start=Date.now();await page.getByRole('link',{name:section,exact:true}).click();
  if(await page.getByText('Portal wird geladen …',{exact:true}).count())throw new Error('Old loading notice');
  await ready();timings.push({section,ms:Date.now()-start});
 }
 await shot('tab-revisit-1440');
 if(errors.length)throw new Error('Browser errors '+JSON.stringify(errors));
 fs.writeFileSync('work/browser-results.json',JSON.stringify({fixtureOnly:true,logo:'External logo request intentionally blocked; same restriction for before/after.',results,timings,requests,errors,gallery},null,2));
 fs.writeFileSync(out+'/gallery.html','<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>WAVE4B-TB01 Review</title><style>body{font:16px system-ui;margin:24px;background:#f5f5f5}section{margin:24px 0}img{display:block;max-width:100%;height:auto;border:1px solid #ccc}a{color:#0645ad}</style><h1>WAVE4B-TB01 – synthetische QA</h1><p>Alle Bilder verwenden ausschließlich synthetische API-Antworten. Kein Live-Backend, keine echten Konto-/Finanzdaten. Eingabefelder sind in Screenshots verdeckt. Externes Logo wurde bei Vorher und Nachher blockiert. Kein Speichern, kein Auszahlungsvorgang.</p><p>Ohne Belohnung ist ausschließlich eine isolierte synthetische Fixture. Policy und Server-Speicherzustände sind mangels Runtime-Vertrag nicht produktiv eingebunden.</p>'+gallery.map(name=>`<section><h2>${name}</h2><a href="${name}.png"><img loading="lazy" src="${name}.png" alt="${name}"></a></section>`).join(''));
 console.log(JSON.stringify({checks:results.length,screenshots:gallery.length,timings,errors}));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
