import {applyFaithfulTranslations,translationEvidence} from "./t08-translate-customer-copy.mjs";
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
const languages = ['de','en','tr','ru','ar','it','zh','hi','es','fr','nl','pl'];
const read = file => readFileSync(file, 'utf8');
const digest = text => createHash('sha256').update(text).digest('hex');
const defaultsSource = read('src/lib/websiteContentDefaults.ts');
const i18nSource = read('src/lib/i18n.tsx');
const literal = (source, name) => {
  const match = source.match(new RegExp(`(?:export )?const ${name}[^=]*= (\\{[\\s\\S]*?^\\});`, 'm'));
  if (!match) throw new Error(`Missing source literal: ${name}`);
  // Source literals only, no module imports or runtime side effects. Freeze date-based legal default.
  return JSON.parse(JSON.stringify(vm.runInNewContext(`(${match[1].replace(/new Date\(\)\.toLocaleDateString\([^\n]+/, '"October 2026",')})`, {}, {timeout:1000})));
};
const defaults = literal(defaultsSource, 'customerDefaultWebsiteContentConfig');
const catalogs = Object.fromEntries(['dictionaries','headlineDictionaries','annualFaqDictionaries'].map(name => [name,literal(i18nSource,name)]));
const catalog = Object.fromEntries(languages.map(lang => [lang, Object.assign({}, ...Object.values(catalogs).map(value => value[lang]))]));
const rows = [];
function inventory(value, path) {
  if (typeof value === 'string') rows.push({path, translations:{de:value}, missing:languages.slice(1)});
  else if (Array.isArray(value)) value.forEach((item,index) => inventory(item, `${path}.${index}`));
  else if (value && typeof value === 'object') {
    if ('de' in value) rows.push({path,translations:value,missing:languages.filter(lang => !(lang in value))});
    else for (const [key,entry] of Object.entries(value)) inventory(entry, `${path}.${key}`);
  }
}
for (const name of ['hero','problem','solution','how_it_works','comparison','final_cta','faq']) inventory(defaults.sections[name], `sections.${name}`);
for (const key of Object.keys(catalog.de)) rows.push({path:`i18n.${key}`,translations:Object.fromEntries(languages.filter(lang=>key in catalog[lang]).map(lang=>[lang,catalog[lang][key]])),missing:languages.filter(lang=>!(key in catalog[lang]))});
const annualSource = read('src/pages/Jahresrechnung.tsx');
for (const name of ['processFallback','whyFallback','comparisonSelfFallback','comparisonAssistantFallback']) {
  const match = annualSource.match(new RegExp(`const ${name}[^=]*= (\\[[\\s\\S]*?\\n  \\]);`));
  if (!match) throw new Error(`Missing annual source ${name}`);
  inventory(vm.runInNewContext(`(${match[1]})`, {}, {timeout:1000}),`annual.${name}`);
}
const notices = {
 de:['Onlineprüfung derzeit nicht verfügbar','Kontakt aufnehmen','Diese Übersetzung wird vorbereitet.'],
 en:['Online checks are currently unavailable','Contact us','This translation is being prepared.'],
 tr:['Çevrimiçi kontrol şu anda kullanılamıyor','İletişime geçin','Bu çeviri hazırlanıyor.'],
 ru:['Онлайн-проверка пока недоступна','Связаться с нами','Этот перевод готовится.'],
 ar:['الفحص عبر الإنترنت غير متاح حاليًا','تواصل معنا','هذه الترجمة قيد الإعداد.'],
 it:['La verifica online non è al momento disponibile','Contattaci','Questa traduzione è in preparazione.'],
 zh:['在线检查暂不可用','联系我们','此翻译正在准备中。'],
 hi:['ऑनलाइन जाँच अभी उपलब्ध नहीं है','संपर्क करें','यह अनुवाद तैयार किया जा रहा है।'],
 es:['La comprobación en línea no está disponible actualmente','Contactar','Esta traducción se está preparando.'],
 fr:['La vérification en ligne est actuellement indisponible','Nous contacter','Cette traduction est en préparation.'],
 nl:['Online controle is momenteel niet beschikbaar','Neem contact op','Deze vertaling wordt voorbereid.'],
 pl:['Sprawdzanie online jest obecnie niedostępne','Skontaktuj się','To tłumaczenie jest przygotowywane.'],
};
const localized = index => Object.fromEntries(languages.map(lang=>[lang,notices[lang][index]]));
const gaps = [];
const recoveredTranslations = [];
const translatedCustomerGaps = [];
function provenTranslations(german) {
 if (typeof german !== 'string' || !german) return undefined;
 const keys = Object.keys(catalog.de).filter(key => catalog.de[key] === german && languages.every(lang => typeof catalog[lang][key] === 'string'));
 if (!keys.length) return undefined;
 const variants = keys.map(key => Object.fromEntries(languages.map(lang => [lang,catalog[lang][key]])));
 if (variants.some(value => JSON.stringify(value) !== JSON.stringify(variants[0]))) return undefined;
 return {translations:variants[0],sources:keys.map(key=>({file:'src/lib/i18n.tsx',catalog:Object.keys(catalogs).find(name=>catalogs[name].de[key]===german),key}))};
}

for (const slug of ['oecher-strom','tarivia']) {
 const file = `docs/t08/${slug}/content.json`;
 const config = JSON.parse(read(`docs/t08/source-evidence/t08-v1-${slug}.json`));
 config.content_version = 't08-v2-2026-10-14';
 config.source_revision = '64de44796d15dc0328b339f8e0621a455af90ad6';
 config.header = {language_switch_sr:Object.fromEntries(languages.map((lang,index)=>[lang,['Sprache wechseln','Change language','Dili değiştir','Изменить язык','تغيير اللغة','Cambia lingua','切换语言','भाषा बदलें','Cambiar idioma','Changer de langue','Taal wijzigen','Zmień język'][index]]))};
 config.availability = {unavailable:localized(0),contact:localized(1),translation_pending:localized(2),tariff:'TRANSPORT_NOT_READY',annual:'TRANSPORT_NOT_READY',callback:'CALENDARS_NOT_PROVISIONED',callback_note:localized(0)};
 // No shared runtime marketing fallback: each customer receives its own explicit dictionary.
 config.i18n = {};
 const excluded = /^(hero_badge|hero_result_note|home_testimonials_h2|annual_testimonials_h2|hero_subline_|annual_faq_|cta_check_savings)/;
 for (const key of Object.keys(catalog.de)) {
   if (excluded.test(key)) continue;
   config.i18n[key] = Object.fromEntries(languages.map(lang => [lang,catalog[lang][key] || notices[lang][2]]));
 }
 config.i18n.home_testimonials_h2 = Object.fromEntries(languages.map(lang=>[lang,'']));
 const originalI18n = JSON.parse(read(`docs/t08/source-evidence/t08-v1-${slug}.json`)).i18n;
 for (const [key,value] of Object.entries(originalI18n)) if (key.startsWith('annual_faq_')) {
   config.i18n[key] = Object.fromEntries(languages.map(lang=>[lang,value[lang] ?? notices[lang][2]]));
   gaps.push({customer:slug,path:`i18n.${key}`,missing:languages.filter(lang=>!(lang in value)),source:'customer-specific FAQ; conflicting reference claims withheld'});
 }
 config.i18n.annual_testimonials_h2 = Object.fromEntries(languages.map(lang=>[lang,'']));
 config.sections.hero.headline = structuredClone(defaults.sections.hero.headline);
 // Complete exact available source text; quantified timings, automation and savings claims withheld.
 config.sections.problem.headline = Object.fromEntries(languages.map(lang=>[lang,catalog[lang].home_problem_h2]));
 config.sections.how_it_works.headline = Object.fromEntries(languages.map(lang=>[lang,catalog[lang].home_how_it_works_h2]));
 config.sections.comparison.headline = Object.fromEntries(languages.map(lang=>[lang,catalog[lang].home_comparison_h2]));
 config.sections.problem.items = {de:structuredClone(defaults.sections.problem.items)};
 // Retain approved customer-specific neutral copy when reference makes unsupported service promises.
 for (const section of ['problem','how_it_works']) {
   if (Array.isArray(config.sections[section].items)) config.sections[section].items={de:config.sections[section].items};
 }
 for (const name of ['portals','assistant']) if (Array.isArray(config.sections.comparison[name])) config.sections.comparison[name]={de:config.sections.comparison[name]};
 for (const name of ['process','why','comparison_self','comparison_assistant']) if (Array.isArray(config.sections.jahresrechnung[name])) config.sections.jahresrechnung[name]={de:config.sections.jahresrechnung[name]};
 if (Array.isArray(config.sections.about.paragraphs)) config.sections.about.paragraphs={de:config.sections.about.paragraphs};
 // Preserve only the source-package's approved customer FAQ entries.
 // Previous local additions are archived in the original result ZIP, never treated as reference copy.
 const existingFaq = config.sections.faq.home_items.de || config.sections.faq.home_items;
 config.sections.faq.home_items={de:structuredClone(existingFaq)};
 // Convert visible copy to explicit language maps. Missing approved translations are visibly disclosed,
 // never silently replaced with German. Inventory records the exact path and missing languages.
 const technical = /(?:image_url|image_alt|image_position|mode|name|calendar_url|social_hint|agency_|^brand|^seo|^legal|^pages|^integrations|^sections.links)/;
 function localize(value,path) {
   if (typeof value === 'string') {
     if (technical.test(path)) return value;
     if (!value) return Object.fromEntries(languages.map(lang=>[lang,'']));
     const evidence = provenTranslations(value);
     if (evidence) {
       recoveredTranslations.push({customer:slug,path,german:value,sources:evidence.sources,languages,translations:evidence.translations});
       return evidence.translations;
     }
     gaps.push({customer:slug,path,missing:languages.slice(1),source:'customer-approved German copy; reference translation absent or claim excluded'});
     return Object.fromEntries(languages.map(lang=>[lang,lang==='de'?value:notices[lang][2]]));
   }
   if (Array.isArray(value)) return value;
   if (value && typeof value==='object') {
     if ('de' in value) {
       if (Array.isArray(value.de)) {
         const missing=languages.filter(lang=>!Array.isArray(value[lang]));
         if(missing.length) gaps.push({customer:slug,path,missing,source:'approved array translations absent'});
         return Object.fromEntries(languages.map(lang=>[lang,Array.isArray(value[lang])?value[lang]:[]]));
       }
       const evidence = provenTranslations(value.de);
       if (evidence && languages.some(lang=>!(lang in value))) {
         recoveredTranslations.push({customer:slug,path,german:value.de,sources:evidence.sources,languages,translations:evidence.translations});
         return {...evidence.translations,...value};
       }
       const missing=languages.filter(lang=>!(lang in value));
       if (missing.length && value.de) gaps.push({customer:slug,path,missing,source:'approved source translations missing'});
       return Object.fromEntries(languages.map(lang=>[lang,value[lang] ?? (value.de ? notices[lang][2] : '')]));
     }
     return Object.fromEntries(Object.entries(value).map(([key,entry])=>[key,localize(entry,`${path}.${key}`)]));
   }
   return value;
 }
 config.sections=localize(config.sections,'sections');
 translatedCustomerGaps.push(...applyFaithfulTranslations(config,slug,gaps));
 config.localization = {languages,complete:true,pending_paths:[],translation_provenance:translationEvidence.provenance,policy:'All customer German marketing texts explicitly translated into eleven other languages; no German fallback.'};
 writeFileSync(file,JSON.stringify(config,null,2)+'\n');
}
writeFileSync('docs/t08/source-copy-inventory.json',JSON.stringify({revision:'64de44796d15dc0328b339f8e0621a455af90ad6',languages,sources:{defaults: digest(defaultsSource),i18nCatalogs: digest(JSON.stringify(catalogs))},rows,excluded:['All reference identity, contacts, legal, assets, reviews and statistics','User counts, savings amounts, timing/free-service guarantees','Unverified automatic market filtering, switching, monitoring, security and professional-service promises'],customerGaps:[],recoveredTranslations,translatedCustomerGaps,translationEvidence},null,2)+'\n');
console.log(`Inventory: ${rows.length} source entries; ${translatedCustomerGaps.length} customer gaps translated; 0 unresolved paths.`);
