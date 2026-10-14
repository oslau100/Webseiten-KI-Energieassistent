/** Offline JSON-Patch preparation only. No SQL, network, deployment or database writes. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const locations={'oecher-strom':'NPhuVMAaBPQz6OhIPpkj',tarivia:'uGJsQ3CWvFTraTfrRgjC'};
const allowed=new Set(['header','hero','problem','solution','how_it_works','comparison','testimonials','about','stats','faq','final_cta','footer']);
const escape=key=>key.replaceAll('~','~0').replaceAll('/','~1');
const clone=value=>structuredClone(value);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const assetKey=key=>/(?:url|image|logo|favicon|asset|calendar|social|integration|link)/i.test(key);
const sectionNames=new Set(['hero','problem','solution','how_it_works','comparison','testimonials','about','stats','faq','final_cta','callback','jahresrechnung']);
function copyMarketing(target,draft){
 for(const[key,value]of Object.entries(draft)){
  if(assetKey(key) || ['mode','name'].includes(key))continue;
  if(value && typeof value==='object' && !Array.isArray(value)){
   if(!target[key] || typeof target[key]!=='object' || Array.isArray(target[key]))target[key]={};
   copyMarketing(target[key],value);
  }else target[key]=clone(value);
 }
}
function diff(before,after,path='',out=[]){
 if(equal(before,after))return out;
 if(before && after && typeof before==='object' && typeof after==='object' && !Array.isArray(before) && !Array.isArray(after)){
  for(const key of Object.keys(after)){
   const p=`${path}/${escape(key)}`;
   if(!(key in before))out.push({op:'add',path:p,value:after[key]});else diff(before[key],after[key],p,out);
  }
  return out;
 }
 out.push({op:'replace',path,value:after});return out;
}
export function prepareSafeConfigDiff(slug,live,draft){
 if(!locations[slug] || live.location_id!==locations[slug])throw new Error('LOCATION_MISMATCH');
 const baseline=clone(live),final=clone(live);
 if(live.webseite_content_config?.legal?.ready!==true)throw new Error('APPROVED_LIVE_LEGAL_REQUIRED');
 const current=live.webseite_layout_config?.pages?.home?.sections;
 if(!Array.isArray(current))throw new Error('LIVE_LAYOUT_REQUIRED');
 const id=entry=>typeof entry==='string'?entry:entry?.id;
 const ids=current.map(id);
 if(ids.some(name=>!allowed.has(name)) || new Set(ids).size!==ids.length)throw new Error('UNREVIEWED_LAYOUT');
 const at=ids.indexOf('final_cta');
 if(at>=0 && typeof current[at]==='object' && (current[at].visible===false || current[at].enabled===false))throw new Error('EXPLICITLY_HIDDEN_CTA_REQUIRES_REVIEW');
 if(at<0){
  const footer=ids.indexOf('footer');
  final.webseite_layout_config.pages.home.sections.splice(footer<0?current.length:footer,0,'final_cta');
 }
 const content=final.webseite_content_config;
 content.sections??={};
 for(const[name,value]of Object.entries(draft.sections)){
  if(!sectionNames.has(name))continue;
  content.sections[name]??={};copyMarketing(content.sections[name],value);
 }
 content.i18n={...content.i18n,...clone(draft.i18n)};
 content.header={...content.header,...clone(draft.header)};
 content.availability={...content.availability,...clone(draft.availability)};
 content.localization=clone(draft.localization);
 content.content_version=draft.content_version;
 content.source_revision=draft.source_revision;
 // Assets/design/identity/legal/pages/integrations/route links are never taken from historical drafts.
 for(const field of ['legal','brand','seo','pages','integrations'])if(!equal(content[field],baseline.webseite_content_config[field]))throw new Error('PROTECTED_CONTENT_CHANGED');
 if(!equal(final.webseite_design_config,baseline.webseite_design_config))throw new Error('DESIGN_CHANGED');
 const changes=diff(baseline,final);
 if(changes.some(op=>assetKey(op.path.split('/').slice(-1)[0]) || /^\/webseite_design_config|^\/webseite_content_config\/(?:legal|brand|pages|seo|integrations)(?:\/|$)|^\/webseite_content_config\/sections\/links(?:\/|$)/.test(op.path)))throw new Error('PROTECTED_PATH_IN_DIFF');
 // Entire-row test ensures new paths are added only to the exact reviewed public baseline.
 const patch=[{op:'test',path:'',value:baseline},...changes];
 const rollback=[{op:'test',path:'',value:final},{op:'replace',path:'',value:baseline}];
 return {mode:'REVIEW_ONLY_REQUIRES_SEPARATE_APPROVAL',location_id:live.location_id,baseline_sha256:digest(baseline),result_sha256:digest(final),patch,rollback,final};
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
 const[slug,input,output]=process.argv.slice(2);
 if(!slug || !input || !output)throw new Error('Usage: node scripts/t08-safe-config-diff.mjs <oecher-strom|tarivia> <approved-live-row.json> <review-only-diff.json>');
 const live=JSON.parse(readFileSync(input,'utf8'));const draft=JSON.parse(readFileSync(`docs/t08/${slug}/content.json`,'utf8'));
 const result=prepareSafeConfigDiff(slug,live,draft);writeFileSync(output,JSON.stringify(result,null,2)+'\n');
 console.log('Prepared local review diff only. Production configuration was not modified.');
}
