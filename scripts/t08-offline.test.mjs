import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import assert from 'node:assert/strict';
import test from 'node:test';
const read = path => readFileSync(path,'utf8');
const json = path => JSON.parse(read(path));
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(stripTypeScriptTypes(source,{mode:'strip'})).toString('base64')}`;
const resolverUrl = moduleUrl(read('src/lib/websiteContentResolver.ts'));
const resolver = await import(resolverUrl);
const theme = await import(moduleUrl(read('src/lib/websiteTheme.ts')));
const sections = await import(moduleUrl(read('src/lib/websiteSections.ts').replace('"./websiteContentResolver"',JSON.stringify(resolverUrl))));
const inventory = json('docs/t08/source-copy-inventory.json');
const languages = inventory.languages;
function languageMaps(value,path='') {
 if (!value || typeof value!=='object') return;
 if ('de' in value) assert.deepEqual(Object.keys(value).sort(),[...languages].sort(),path);
 else for(const[key,entry]of Object.entries(value)) languageMaps(entry,`${path}.${key}`);
}
test('production primary and CTA hues, contrast and malicious CSS values',()=>{
 for(const slug of ['oecher-strom','tarivia']) {
  const colors=json(`docs/t08/${slug}/design.json`).colors;
  const tokens=theme.websiteThemeTokens({colors});
  assert.equal(tokens['--primary'],theme.hexToHsl(colors.primary));
  assert.equal(tokens['--cta'],theme.hexToHsl(colors.cta));
  for(const background of ['primary','cta','accent']) {
   const text=tokens[`--${background}-foreground`]===theme.hexToHsl('#000000')?'#000000':'#FFFFFF';
   assert.ok(theme.contrast(colors[background],text)>=4.5);
  }
 }
 for(const primary of ['red','#abc','url(evil)','var(--x)',';color:red']) assert.deepEqual(theme.websiteThemeTokens({colors:{primary}}),{});
});
test('registry order, explicit visibility, duplicates and unknown components',()=>{
 const layout={pages:{home:{sections:['second',{id:'first',visible:false},'second','__proto__','script',{id:'third',enabled:true}]}}};
 assert.deepEqual(sections.websiteSections(layout,'home',['first','second','third'],true),['second','third']);
 assert.deepEqual(sections.websiteSections({},'annual',['hero'],true),[]);
 assert.deepEqual(sections.websiteSections({},'annual',['hero'],false),['hero']);
});
test('strict localization prevents silent German and foreign-language fallbacks',()=>{
 const content={title:{de:'Deutsch',en:'English'}};
 assert.equal(resolver.resolveLocalizedText(content,'title','pending','ar',false),'pending');
 assert.equal(resolver.resolveLocalizedText(content,'title','pending','en',false),'English');
 assert.equal(resolver.resolveLocalizedText({title:'Deutsch'},'title','pending','ar',false),'pending');
 assert.equal(resolver.resolveLocalizedText(content,'title','pending','ar',true),'Deutsch');
});
for(const [slug,other,location,otherLocation] of [
 ['oecher-strom','Tarivia','NPhuVMAaBPQz6OhIPpkj','uGJsQ3CWvFTraTfrRgjC'],
 ['tarivia','Öcher Strom','uGJsQ3CWvFTraTfrRgjC','NPhuVMAaBPQz6OhIPpkj'],
]) {
 test(`${slug}: independent configuration, source copies and complete explicit language keys`,()=>{
  const content=json(`docs/t08/${slug}/content.json`);
  assert.equal(content.content_version,'t08-v2-2026-10-14');
  assert.equal(content.source_revision,inventory.revision);
  const serialized=JSON.stringify(content);
  assert.ok(!serialized.includes(other));assert.ok(!serialized.includes(otherLocation));assert.ok(!serialized.includes('Ehiogie'));
  assert.equal(content.legal.ready,false);
  languageMaps(content.sections);languageMaps(content.i18n);languageMaps(content.availability);languageMaps(content.header);
  assert.equal(content.sections.faq.home_items.de.length,3);
  assert.deepEqual(content.sections.faq.home_items.de,json(`docs/t08/source-evidence/t08-v1-${slug}.json`).sections.faq.home_items);
  assert.deepEqual(content.sections.jahresrechnung.cta,inventory.recoveredTranslations.find(row=>row.customer===slug).translations);
  const source=inventory.rows.find(row=>row.path==='sections.hero.headline');
  assert.deepEqual(content.sections.hero.headline,source.translations);
  for(const prefix of ['home_problem_h2','home_how_it_works_h2','home_comparison_h2','annual_hero_h1']){
   assert.deepEqual(content.i18n[prefix],inventory.rows.find(row=>row.path===`i18n.${prefix}`).translations);
  }
  assert.ok(content.sections.solution.image_url.includes(location));
 });
 test(`${slug}: zero unverified reviews and statistics, explicit readiness and translation gaps`,()=>{
  const content=json(`docs/t08/${slug}/content.json`);
  assert.deepEqual(content.sections.testimonials.home_reviews,[]);
  assert.deepEqual(content.sections.stats.items,[]);
  assert.deepEqual(content.sections.jahresrechnung.reviews,[]);
  assert.equal(content.availability.tariff,'TRANSPORT_NOT_READY');
  assert.equal(content.availability.callback,'CALENDARS_NOT_PROVISIONED');
  assert.equal(content.localization.complete,true);
  assert.deepEqual(content.localization.pending_paths,inventory.customerGaps.filter(g=>g.customer===slug).map(g=>g.path));
 });
 test(`${slug}: both layouts whitelist actual sections and final CTA independently`,()=>{
  const layout=json(`docs/t08/${slug}/layout.json`);
  for(const page of ['home','annual']){
   const result=sections.websiteSections(layout,page,['hero','problem','solution','how_it_works','comparison','testimonials','about','stats','faq','final_cta','process','why','value'],true);
   assert.equal(result[0],'hero');assert.ok(result.includes('final_cta'));assert.ok(result.includes('stats'));
  }
 });
}
test('deterministic inventory and payload regeneration',async()=>{
 const files=['docs/t08/source-copy-inventory.json',...['oecher-strom','tarivia'].map(slug=>`docs/t08/${slug}/content.json`)];
 const before=files.map(read);
 await import('./t08-content-inventory.mjs');
 assert.deepEqual(files.map(read),before);
 assert.equal(inventory.rows.length,146);
 assert.equal(inventory.customerGaps.length,0);
 assert.equal(inventory.translatedCustomerGaps.length,92);
 assert.equal(inventory.recoveredTranslations.length,2);
 for(const row of inventory.recoveredTranslations) {
  assert.equal(row.path,'sections.jahresrechnung.cta');
  assert.equal(row.sources[0].key,'header_check_bill');
  assert.deepEqual(row.translations,inventory.rows.find(r=>r.path==='i18n.header_check_bill').translations);
 }
});
test('image containment and responsive logo constraints remain encoded',()=>{
 for(const file of ['Hero','Solution']) {
  const code=read(`src/components/${file}.tsx`);
  assert.ok(code.includes('object-contain'));assert.ok(code.includes('max-h-['));
  assert.ok(!/scale-\[1\.[3-9]|scale-1[125]0|-[mp][lr]-1[246]/.test(code));
 }
 for(const file of ['Header','Footer']){
  const code=read(`src/components/${file}.tsx`);
  assert.ok(code.includes('max-w-['));assert.ok(code.includes('Tarivia'));assert.ok(code.includes('max-h-'));
 }
});
test('legal typography activated with unchanged sanitization rather than raw HTML',()=>{
 assert.ok(read('tailwind.config.ts').includes('require("@tailwindcss/typography")'));
 assert.ok(read('src/components/LegalPage.tsx').includes('parseLegalHtml'));
 assert.ok(!read('src/components/LegalPage.tsx').includes('dangerouslySetInnerHTML'));
});
test('native callback and intentional gates remain wired',()=>{
 assert.ok(read('src/pages/RueckrufBuchen.tsx').includes('<CallbackBookingWidget'));
 assert.ok(read('src/components/CustomerRuntimeBoundary.tsx').includes('TRANSPORT_NOT_READY'));
 assert.ok(read('functions/_middleware.ts').includes('/loaders'));
 const code=read('src/lib/i18n.tsx');
 assert.ok(code.includes('document.documentElement.dir'));assert.ok(code.includes('navigate('));assert.ok(!code.includes('window.location.assign'));
});
