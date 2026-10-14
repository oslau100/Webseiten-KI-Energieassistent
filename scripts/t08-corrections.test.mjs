import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import assert from 'node:assert/strict';
import test from 'node:test';
import {prepareSafeConfigDiff} from './t08-safe-config-diff.mjs';
const read=path=>readFileSync(path,'utf8');const json=path=>JSON.parse(read(path));
const url=source=>`data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source)).toString('base64')}`;
const theme=await import(url(read('src/lib/websiteTheme.ts')));
const toHex=hsl=>{
 const[h,s,l]=hsl.replaceAll('%','').split(' ').map(Number);const a=s/100*Math.min(l/100,1-l/100);
 const channel=n=>{const k=(n+h/30)%12;return Math.round(255*(l/100-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0');};
 return '#'+[0,8,4].map(channel).join('');
};
const source=json('docs/t08/translations/source.json');
const inv=json('docs/t08/source-copy-inventory.json');
const languages=inv.languages;
function path(obj,path){return path.split('.').reduce((v,k)=>v[k],obj);}
function apply(doc,operations){
 let result=structuredClone(doc);
 for(const op of operations){
  if(op.path===''){if(op.op==='test')assert.deepEqual(result,op.value);else result=structuredClone(op.value);continue;}
  const keys=op.path.slice(1).split('/').map(k=>k.replaceAll('~1','/').replaceAll('~0','~'));const last=keys.pop();let parent=result;for(const k of keys)parent=parent[k];
  if(op.op==='test')assert.deepEqual(parent[last],op.value);else parent[last]=structuredClone(op.value);
 }
 return result;
}
for(const[slug,location]of [['oecher-strom','NPhuVMAaBPQz6OhIPpkj'],['tarivia','uGJsQ3CWvFTraTfrRgjC']]){
 const content=json(`docs/t08/${slug}/content.json`);const design=json(`docs/t08/${slug}/design.json`);
 test(`${slug}: readable primary ink and secondary foreground on actual surfaces`,()=>{
  const tokens=theme.websiteThemeTokens(design);
  for(const surface of ['background','secondary']){
   const bg=toHex(tokens[`--${surface}`]);const fg=toHex(tokens[surface==='background'?'--primary-ink':'--secondary-foreground']);
   assert.ok(theme.contrast(bg,fg)>=4.5,`${surface}: ${bg}/${fg}`);
  }
  assert.ok(read('tailwind.config.ts').includes('"primary-ink": "hsl(var(--primary-ink, var(--primary)))"'));
  for(const file of ['src/components/Solution.tsx','src/components/FinalCTA.tsx','src/pages/Jahresrechnung.tsx']){
   const buttons=[...read(file).matchAll(/<Button\b[^>]*variant="secondary"[^>]*className="([^"]*)"/g)];
   assert.ok(buttons.length>0);for(const b of buttons){assert.ok(b[1].includes('text-secondary-foreground'));assert.ok(!/text-primary(?!-foreground)/.test(b[1]));}
  }
  assert.ok(!read('src/index.css').includes('.text-primary {'));
 });
 test(`${slug}: all previous gap paths and leaves translated; German and structure preserved`,()=>{
  assert.equal(content.localization.complete,true);assert.deepEqual(content.localization.pending_paths,[]);
  const old=json('docs/t08/source-evidence/t08-original-44-recheck-input.json').configs[slug];
  for(const gap of inv.translatedCustomerGaps.filter(row=>row.customer===slug)){
   const value=path(content,gap.path);
   // Original source differs only by removal of unsourced FAQ additions before this correction.
   if(gap.path!=='sections.faq.home_items')assert.deepEqual(value.de,path(old,gap.path).de);
   for(const lang of languages){assert.equal(typeof value[lang],typeof value.de);if(Array.isArray(value.de))assert.equal(value[lang].length,value.de.length);assert.ok(!JSON.stringify(value[lang]).includes('Diese Übersetzung wird vorbereitet'));}
  }
  for(const row of source)for(const use of row.uses.filter(use=>use.customer===slug)){
   for(const lang of languages.slice(1)){
    const text=path(content,use.path.replace('.de',`.${lang}`));assert.ok(typeof text==='string'&&text.length>0);
    assert.ok(!text.includes('{{brand}}'));
    for(const token of row.de.match(/\b(?:177|477|EUR|BeConnected)\b/g)||[])assert.ok(text.includes(token));
   }
  }
  assert.deepEqual(content.sections.testimonials.home_reviews,[]);assert.deepEqual(content.sections.stats.items,[]);
 });
 const live={location_id:location,webseite_content_config:{brand:{name:content.brand.name,contact_email:'approved@example.test'},seo:{site_url:'https://approved.example.test'},legal:{ready:true,variables:{firma:'Fixture only'}},pages:{impressum:{html:'<p>Approved fixture</p>'}},integrations:{approved:true},sections:{solution:{image_url:'/approved/phone.png',image_alt:'Approved alt',image_position:'left'},about:{name:'Approved identity',mode:'company',image_url:'/approved/about.png'},callback:{calendar_url:'/approved/calendar'},links:{tarif:'/tarif'}}},webseite_design_config:{assets:{logo_header:'/approved/logo.png',hero_image:'/approved/hero.png'},colors:{primary:design.colors.primary}},webseite_layout_config:{pages:{home:{sections:['header','hero','faq','footer']},annual:{sections:['hero','footer']}}}};
 test(`${slug}: separately prepared home CTA diff preserves live legal and every asset/identity`,()=>{
  const proposal=prepareSafeConfigDiff(slug,live,content);
  const result=apply(live,proposal.patch);assert.deepEqual(result,proposal.final);
  assert.deepEqual(result.webseite_layout_config.pages.home.sections,['header','hero','faq','final_cta','footer']);
  assert.deepEqual(result.webseite_layout_config.pages.annual,live.webseite_layout_config.pages.annual);
  for(const key of ['brand','seo','legal','pages','integrations'])assert.deepEqual(result.webseite_content_config[key],live.webseite_content_config[key]);
  assert.deepEqual(result.webseite_design_config,live.webseite_design_config);
  for(const section of ['solution','about','callback','links'])for(const[key,value]of Object.entries(live.webseite_content_config.sections[section]))assert.deepEqual(result.webseite_content_config.sections[section][key],value);
  assert.equal(result.webseite_content_config.legal.ready,true);
  assert.deepEqual(apply(result,proposal.rollback),live);
  const drift=structuredClone(live);drift.webseite_content_config.legal.variables.firma='changed';assert.throws(()=>apply(drift,proposal.patch));
  assert.equal(prepareSafeConfigDiff(slug,result,content).patch.length,1);
 });
 test(`${slug}: rejects unsafe baselines and preserves explicit layout decisions`,()=>{
  const wrong=structuredClone(live);wrong.location_id='foreign';assert.throws(()=>prepareSafeConfigDiff(slug,wrong,content),/LOCATION_MISMATCH/);
  const unapproved=structuredClone(live);unapproved.webseite_content_config.legal.ready=false;assert.throws(()=>prepareSafeConfigDiff(slug,unapproved,content),/APPROVED_LIVE_LEGAL/);
  const injected=structuredClone(live);injected.webseite_layout_config.pages.home.sections.push('arbitrary_component');assert.throws(()=>prepareSafeConfigDiff(slug,injected,content),/UNREVIEWED_LAYOUT/);
  const hidden=structuredClone(live);hidden.webseite_layout_config.pages.home.sections.push({id:'final_cta',enabled:false});assert.throws(()=>prepareSafeConfigDiff(slug,hidden,content),/EXPLICITLY_HIDDEN/);
 });
}
test('all eleven translation tables preserve 85 corresponding German source rows',()=>{
 assert.equal(source.length,85);
 for(const lang of languages.slice(1)){const rows=read(`docs/t08/translations/${lang}.txt`).trimEnd().split('\n');assert.equal(rows.length,85);assert.ok(rows.every(Boolean));}
 assert.equal(inv.translatedCustomerGaps.length,92);assert.deepEqual(inv.customerGaps,[]);
});
