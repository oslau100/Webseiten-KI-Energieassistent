import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const languages=['en','tr','ru','ar','it','zh','hi','es','fr','nl','pl'];
const source=JSON.parse(readFileSync('docs/t08/translations/source.json','utf8'));
const values=Object.fromEntries(languages.map(lang=>{
 const rows=readFileSync(`docs/t08/translations/${lang}.txt`,'utf8').trimEnd().split('\n');
 if(rows.length!==source.length || rows.some(row=>!row.trim()))throw new Error(`Incomplete ${lang} translation`);
 return [lang,rows];
}));
const normal=text=>text.replaceAll('Öcher Strom','{{brand}}').replaceAll('Tarivia','{{brand}}');
const byGerman=new Map(source.map((row,index)=>[row.de,index]));
function translate(value,lang,brand,key=''){
 if(typeof value==='string'){
  if(!value || ['step','iconKey'].includes(key))return value;
  const index=byGerman.get(normal(value));
  if(index===undefined)throw new Error(`Unresolved German source text: ${value}`);
  const text=values[lang][index];
  if((text.match(/\{\{brand\}\}/g)||[]).length!==(source[index].de.match(/\{\{brand\}\}/g)||[]).length)throw new Error(`Brand placeholder mismatch ${lang}:${index+1}`);
  for(const token of (source[index].de.match(/\b(?:177|477|EUR|BeConnected)\b/g)||[]))if(!text.includes(token))throw new Error(`Source fact lost ${lang}:${index+1}:${token}`);
  return text.replaceAll('{{brand}}',brand);
 }
 if(Array.isArray(value))return value.map(entry=>translate(entry,lang,brand));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,translate(v,lang,brand,k)]));
 return value;
}
export function applyFaithfulTranslations(config,customer,gaps){
 const closed=[];
 for(const gap of gaps.filter(row=>row.customer===customer)){
  const parts=gap.path.split('.');let entry=config;for(const part of parts)entry=entry[part];
  if(!entry || !('de' in entry))throw new Error(`Missing German base ${gap.path}`);
  const german=structuredClone(entry.de);
  for(const lang of gap.missing)entry[lang]=translate(german,lang,config.brand.name);
  if(JSON.stringify(entry.de)!==JSON.stringify(german))throw new Error('German source altered');
  closed.push({...gap,status:'TRANSLATED_FROM_EXISTING_GERMAN',source:'User-authorised faithful translations; not claimed as pre-existing Ehiogie translations.'});
 }
 return closed;
}
export const translationEvidence={languages:['de',...languages],source_texts:source.length,translated_texts:source.length*languages.length,provenance:'Faithful translations of existing customer German text under explicit T08 correction authorisation. Existing source-catalog translations remain unchanged.',sources:Object.fromEntries(['source.json',...languages.map(l=>`${l}.txt`)].map(file=>[file,createHash('sha256').update(readFileSync(`docs/t08/translations/${file}`)).digest('hex')]))};
