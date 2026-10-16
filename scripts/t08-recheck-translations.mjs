/** Read-only exact-text recheck of the preserved 44-file result; no translator or network. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';
import vm from 'node:vm';
const sha=data=>createHash('sha256').update(data).digest('hex');
const read=file=>readFileSync(file,'utf8');
const args=process.argv.slice(2);
const originalPath=args[0] || '/workspace/work/t08-continuation/original-44-evidence.json';
const original=JSON.parse(read(originalPath));
const languages=original.inventory.languages;
function literal(source,name){
 const match=source.match(new RegExp(`(?:export )?const ${name}[^=]*= (\\{[\\s\\S]*?^\\});`,'m'));
 if(!match)throw new Error(`Source literal missing: ${name}`);
 return JSON.parse(JSON.stringify(vm.runInNewContext(`(${match[1]})`,{}, {timeout:1000})));
}
const evidence=[];
const sourceRecords=[];
function addCatalog(file,name,values){
 if(languages.some(lang=>!values[lang]))throw new Error(`Incomplete source catalog ${name}`);
 sourceRecords.push({file,catalog:name,languages,keys:Object.keys(values.de).length,catalog_sha256:sha(JSON.stringify(values))});
 for(const key of Object.keys(values.de))evidence.push({file,catalog:name,key,de:values.de[key],translations:Object.fromEntries(languages.filter(lang=>typeof values[lang][key]==='string').map(lang=>[lang,values[lang][key]]))});
}
const source=read('src/lib/i18n.tsx');
for(const name of ['dictionaries','headlineDictionaries','annualFaqDictionaries','statusPageDictionaries'])addCatalog('src/lib/i18n.tsx',name,literal(source,name));
addCatalog('src/lib/tariffCallbackI18n.ts','tariffCallbackTranslations',literal(read('src/lib/tariffCallbackI18n.ts'),'tariffCallbackTranslations'));
const booking=stripTypeScriptTypes(read('src/lib/publicBookingI18n.ts')).replace(/^import .*;\s*$/mg,'').replace(/export const /g,'const ');
addCatalog('src/lib/publicBookingI18n.ts','bookingTranslations',JSON.parse(JSON.stringify(vm.runInNewContext(`${booking}\nbookingTranslations;`,{}, {timeout:1000}))));
// The original ZIP's verified source inventory retains exact default text and annual arrays.
for(const row of original.inventory.rows)if(!row.path.startsWith('i18n.'))evidence.push({file:row.path.startsWith('annual.')?'src/pages/Jahresrechnung.tsx':'src/lib/websiteContentDefaults.ts',catalog:'original-source-inventory',key:row.path,de:row.translations.de,translations:row.translations});
function get(value,path){return path.split('.').reduce((v,k)=>v?.[k],value);}
function leaves(value,path=''){
 if(typeof value==='string')return value ? [{path,text:value}] : [];
 if(Array.isArray(value))return value.flatMap((v,i)=>leaves(v,`${path}.${i}`));
 if(value && typeof value==='object')return Object.entries(value).filter(([k])=>!['step','iconKey'].includes(k)).flatMap(([k,v])=>leaves(v,`${path}.${k}`));
 return [];
}
const results=original.inventory.customerGaps.map(gap=>{
 const value=get(original.configs[gap.customer],gap.path).de;
 const textLeaves=leaves(value);
 const checked=textLeaves.map(leaf=>{
  const exact=evidence.filter(e=>e.de===leaf.text);
  return {...leaf,exact_source_matches:exact.map(({file,catalog,key,translations})=>({file,catalog,key,translations,missing:languages.filter(lang=>typeof translations[lang]!=='string')}))};
 });
 const targetKey=gap.path.startsWith('i18n.')?gap.path.slice(5):null;
 const keyed=targetKey?evidence.filter(e=>e.key===targetKey && e.file==='src/lib/i18n.tsx'):[];
 const complete=typeof value==='string'?checked[0]?.exact_source_matches.filter(e=>!e.missing.length):[];
 const unique=complete && [...new Set(complete.map(e=>JSON.stringify(e.translations)))];
 const status=complete?.length && unique.length===1?'RECOVERED_EXACT':keyed.length?'NON_EQUIVALENT_GERMAN_KEY':checked.every(leaf=>leaf.exact_source_matches.length>0)?'ORIGINAL_GERMAN_ONLY':'NO_EQUIVALENT_ORIGINAL';
 return {customer:gap.customer,path:gap.path,original_missing:gap.missing,status,german:value,checked,non_equivalent_catalog_entries:keyed.filter(e=>e.de!==value),resolution:status==='RECOVERED_EXACT'?complete[0]:null};
});
const summary=Object.fromEntries(['RECOVERED_EXACT','NON_EQUIVALENT_GERMAN_KEY','ORIGINAL_GERMAN_ONLY','NO_EQUIVALENT_ORIGINAL'].map(status=>[status,results.filter(row=>row.status===status).length]));
const removedFaqAdditions=['oecher-strom','tarivia'].map(customer=>{
 const approved=JSON.parse(read(`docs/t08/source-evidence/t08-v1-${customer}.json`)).sections.faq.home_items;
 const previous=original.configs[customer].sections.faq.home_items.de;
 const current=JSON.parse(read(`docs/t08/${customer}/content.json`)).sections.faq.home_items.de;
 if(JSON.stringify(current)!==JSON.stringify(approved))throw new Error('Customer FAQ differs from approved package input');
 return {customer,previous_entries:previous.length,retained_approved_entries:current.length,removed_unsourced_entries:previous.filter(entry=>!approved.some(source=>JSON.stringify(entry)===JSON.stringify(source)))};
});
const report={source_sha:original.source_sha,original_zip:original.zip,original_diff:original.diff,original_files_preserved:original.files.length,languages,method:'Byte-exact German string matching; all twelve catalog values copied verbatim. Same-key German mismatch is not a translation. No generated translations, new marketing or foreign customer data.',catalogs:sourceRecords,evidence_entries:evidence.length,original_gap_paths:results.length,summary,remaining_gap_paths:results.filter(r=>r.status!=='RECOVERED_EXACT').length,removedFaqAdditions,results};
writeFileSync('docs/t08/translation-recheck.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({original:results.length,...summary,remaining:report.remaining_gap_paths,catalogs:sourceRecords.length,languages,evidence_entries:evidence.length}));
