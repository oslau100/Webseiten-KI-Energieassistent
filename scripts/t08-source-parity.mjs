/** Pinned Ehiogie source -> explicit per-Location review candidates. No remote writes. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
import {digest,prepareReviewPlan} from './t08-review-plan.mjs';
const revision='3c939883d6d8b8d1542806e9978cac6aad75b87b';
const out=process.argv[2]||'.codex-local/t08-output/followup';
const languages=['de','en','tr','ru','ar','it','zh','hi','es','fr','nl','pl'];
const locations={'oecher-strom':'NPhuVMAaBPQz6OhIPpkj',tarivia:'uGJsQ3CWvFTraTfrRgjC'};
const baseline=JSON.parse(fs.readFileSync(`${out}/live-config-baseline.json`,'utf8'));
const sourceFiles={};const trees={};const variables={};
function source(file){
 if(trees[file])return trees[file];
 const text=execFileSync('git',['show',`${revision}:${file}`],{encoding:'utf8',maxBuffer:4e6});
 sourceFiles[file]={revision,sha256:digest(text)};
 const tree=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);trees[file]=tree;variables[file]={};
 function visit(n){if(ts.isVariableDeclaration(n)&&n.initializer)variables[file][n.name.getText(tree)]=n.initializer;ts.forEachChild(n,visit);}visit(tree);return tree;
}
const evalNode=(node,tree,context={})=>vm.runInNewContext('('+node.getText(tree)+')',context,{timeout:1000});
const catFile='src/lib/i18n.tsx';const catTree=source(catFile);
const catalogs=Object.fromEntries(['dictionaries','headlineDictionaries','annualFaqDictionaries'].map(name=>[name,evalNode(variables[catFile][name],catTree)]));
const catalog=Object.fromEntries(languages.map(lang=>[lang,Object.assign({},...Object.values(catalogs).map(c=>c[lang]))]));
fs.writeFileSync(`${out}/pinned-catalogs.json`,JSON.stringify(catalogs,null,2)+'\n');
const catalogSource=key=>Object.keys(catalogs).find(name=>key in catalogs[name].de);
const defFile='src/lib/websiteContentDefaults.ts';const defTree=source(defFile);
const defaults=evalNode(variables[defFile].customerDefaultWebsiteContentConfig,defTree);
const get=(obj,p)=>p.split('.').reduce((v,k)=>v?.[k],obj);
const set=(obj,p,v)=>{const parts=p.split('.');const key=parts.pop();for(const k of parts)obj=obj[k]??={};obj[key]=structuredClone(v);};
const candidates=new Map();const rows=[];const missing=[];
const technical=/(?:image_url|image_alt|image_position|social|calendar|\.mode$|\.name$|^brand\.|^legal\.|^integrations\.|^pages\.|^sections\.links\.|^sections\.about\.|^sections\.callback\.|^header\.|^cookie\.)/;
function translations(german){
 const keys=Object.keys(catalog.de).filter(k=>catalog.de[k]===german);
 if(!keys.length)return null;
 const records=keys.map(key=>({key,values:Object.fromEntries(languages.filter(l=>typeof catalog[l][key]==='string').map(l=>[l,catalog[l][key]]))}));
 if(records.some(r=>JSON.stringify(r.values)!==JSON.stringify(records[0].values)))return null;
 return records[0];
}
function textCandidate(target,value,file,key){
 if(technical.test(target)||candidates.has(target))return;
 let values=typeof value==='string'?{de:value}:value;
 if(!values||typeof values.de!=='string'||!values.de)return;
 const refs=Object.fromEntries(languages.map(l=>[l,{file,key,source_lang:l}]));
 if(Object.keys(values).length===1){const found=translations(values.de);if(found){values=found.values;for(const l of languages)refs[l]={file:catFile,key:`${catalogSource(found.key)}.${found.key}`,source_lang:l,derivation:'EXACT_GERMAN_VALUE_MATCH'};}}
 candidates.set(target,{kind:'text',values,refs});
}
function arrayCandidate(target,array,file,key){
 if(!Array.isArray(array)||candidates.has(target)||technical.test(target))return;
 const originalArray=structuredClone(array);let ratingSource;
 if(/reviews$/.test(target)){
  const component=target.includes('jahresrechnung')?'src/pages/Jahresrechnung.tsx':'src/components/Testimonials.tsx';
  const original=source(component).text;
  if(!/Array\(5\)|\[1,2,3,4,5\]|\[1, 2, 3, 4, 5\]/.test(original))throw Error('ORIGINAL_RATING_SOURCE_NOT_FOUND');
  array=structuredClone(array).map(review=>({...review,rating:5}));
  ratingSource={file:component,source_file_sha256:sourceFiles[component].sha256,key:'five-star renderer',value:5};
 }
 const refs={};
 function localize(v,lang,p){
  if(typeof v==='string'){
   // Icons, number suffixes, ordinal steps, and reviewer names are source metadata, not translations.
   if(/\.(?:iconKey|step|suffix|name)$/.test(p)){refs[`${lang}:${p}`]={file,key:p,source_lang:'de',kind:'SOURCE_METADATA'};return v;}
   const found=translations(v);const value=lang==='de'?v:found?.values[lang];
   const ref=lang!=='de'&&found?{file:catFile,key:`${catalogSource(found.key)}.${found.key}`,source_lang:lang}:{file,key:p,source_lang:lang};
   refs[`${lang}:${p}`]=ref;
   rows.push({target_path:`${target}.${lang}.${p.slice(key.length+1)}`,source_file:ref.file,source_key:ref.key,source_lang:lang,source_revision:revision,source_file_sha256:sourceFiles[ref.file].sha256,original_value:value??null,value_sha256:value===undefined?null:digest(value),status:value===undefined?'SOURCE_NOT_AVAILABLE':'SOURCE_AVAILABLE',kind:'ARRAY_TEXT_LEAF'});
   return value;
  }
  if(Array.isArray(v)){const a=v.map((x,i)=>localize(x,lang,`${p}.${i}`));return a.some(x=>x===undefined)?undefined:a;}
  if(v&&typeof v==='object'){const o={};for(const[k,x]of Object.entries(v))o[k]=localize(x,lang,`${p}.${k}`);return Object.values(o).some(x=>x===undefined)?undefined:o;}
  return v;
 }
 const values={};for(const lang of languages){const v=localize(array,lang,key);if(v!==undefined)values[lang]=v;}
 candidates.set(target,{kind:'array',values,ratingSource,originalArray,refs:Object.fromEntries(languages.map(lang=>[lang,{file,key,source_lang:lang}]))});
}
// Use defaults before component fallbacks: the original provider merges these defaults first.
function sectionValues(v,p){
 if(technical.test(p))return;
 if(Array.isArray(v)){if(v.length)arrayCandidate(p,v,defFile,p);return;}
 if(typeof v==='string'){if(v)textCandidate(p,v,defFile,p);return;}
 if(v&&typeof v==='object'){if('de'in v){textCandidate(p,v,defFile,p);return;}for(const[k,x]of Object.entries(v))sectionValues(x,`${p}.${k}`);}
}
sectionValues(defaults.sections,'sections');
for(const [name,cat]of Object.entries(catalogs))for(const key of Object.keys(cat.de)){
 if(key.startsWith('cookie_'))continue; // existing tenant consent/legal UI is preserved
 candidates.set(`i18n.${key}`,{kind:'text',values:Object.fromEntries(languages.map(l=>[l,cat[l][key]])),refs:Object.fromEntries(languages.map(l=>[l,{file:catFile,key:`${name}.${key}`,source_lang:l}]))});
}
const arrays={Problem:{fallbackProblems:'sections.problem.items'},HowItWorks:{fallbackSteps:'sections.how_it_works.items'},Comparison:{fallbackPortals:'sections.comparison.portals',fallbackAssistant:'sections.comparison.assistant'},FAQ:{fallbackFaqs:'sections.faq.home_items'},Testimonials:{fallbackReviews:'sections.testimonials.home_reviews'},Stats:{fallbackStats:'sections.stats.items'},Jahresrechnung:{processFallback:'sections.jahresrechnung.process',whyFallback:'sections.jahresrechnung.why',comparisonSelfFallback:'sections.jahresrechnung.comparison_self',comparisonAssistantFallback:'sections.jahresrechnung.comparison_assistant',reviewsFallback:'sections.jahresrechnung.reviews'}};
for(const name of ['Hero','Problem','Solution','HowItWorks','Comparison','FAQ','Testimonials','Stats','About','Header','Footer','Jahresrechnung']){
 const file=name==='Jahresrechnung'?'src/pages/Jahresrechnung.tsx':`src/components/${name}.tsx`;const tree=source(file);
 for(const [variable,target]of Object.entries(arrays[name]||{})){
  if(candidates.has(target))continue;
  const value=evalNode(variables[file][variable],tree);
  arrayCandidate(target,value,file,variable);
 }
 function visit(node){
  if(ts.isCallExpression(node)&&node.expression.getText(tree)==='getText'&&ts.isStringLiteral(node.arguments[0])&&node.arguments[1]){
   const target=node.arguments[0].text;
   const existing=candidates.get(target);
   const fallback=node.arguments[1];
   if(existing&&ts.isCallExpression(fallback)&&fallback.expression.getText(tree)==='t'&&ts.isStringLiteral(fallback.arguments[0])){
    const key=fallback.arguments[0].text;
    if(existing.values.de===catalog.de[key])for(const l of languages)if(existing.values[l]===undefined&&typeof catalog[l][key]==='string'){
     existing.values[l]=catalog[l][key];existing.refs[l]={file:catFile,key:`${catalogSource(key)}.${key}`,source_lang:l,derivation:'EXACT_GERMAN_MATCH_TO_COMPONENT_REFERENCED_CATALOG_KEY'};
    }
   }
   if(!technical.test(target)&&!existing){
    const values={};for(const l of languages){try{const value=evalNode(node.arguments[1],tree,{t:k=>catalog[l][k]});if(typeof value==='string'&&(l==='de'||!ts.isStringLiteral(node.arguments[1])))values[l]=value;}catch{/* Nonliteral identity/derived values require explicit review. */}}
    textCandidate(target,values,file,`getText(${target}).fallback`);
   }
  }
  ts.forEachChild(node,visit);
 }visit(tree);
}
const internalProofs=[];const preserved=[];const snapshots=[];const plans=[];
for(const [slug,id]of Object.entries(locations)){
 const before=baseline.find(r=>r.location_id===id);if(!before)throw Error('LIVE_BASELINE_MISSING');const desired=structuredClone(before);const content=desired.webseite_content_config;
 for(const [target,candidate]of candidates){
  const valueMap={};for(const lang of languages){
   const value=candidate.values[lang];const ref=candidate.refs[lang];
   const row={customer:slug,source_transform:candidate.ratingSource?{kind:'ORIGINAL_ARRAY_PLUS_ORIGINAL_RENDERER_RATING',original_array_literal:candidate.originalArray,rating_source:candidate.ratingSource}:undefined,target_path:`webseite_content_config.${target}.${lang}`,kind:candidate.kind,source_file:ref.file,source_key:ref.key,source_lang:lang,source_revision:revision,source_file_sha256:sourceFiles[ref.file].sha256,derivation:ref.derivation,original_value:value??null,value_sha256:value===undefined?null:digest(value),live_value:get(before.webseite_content_config,`${target}.${lang}`)??(lang==='de'?get(before.webseite_content_config,target):null),planned_value:null,match:null,status:value===undefined?'SOURCE_NOT_AVAILABLE':'SOURCE_AVAILABLE'};
   // Preserve legally/factually necessary customer notices and tenant-specific annual FAQ answers.
   const protectedNotice=/\.(?:result_note|free_note)$/.test(target)||/^i18n\.annual_faq_[2346]_[qa]$/.test(target);
   if(value===undefined){missing.push({customer:slug,target,lang});}
   else if(protectedNotice&&get(before.webseite_content_config,target)!==undefined){row.status='CUSTOMER_NOTICE_PRESERVED';preserved.push({customer:slug,target,lang,reason:'Existing required notice/tenant legal or contact statement preserved'});}
   else{valueMap[lang]=value;row.planned_value=value;row.match=digest(value)===row.value_sha256;}
   rows.push(row);
  }
  if(Object.keys(valueMap).length){
   const current=get(content,target);
   const next=current&&!Array.isArray(current)&&typeof current==='object'?{...current,...valueMap}:valueMap;
   set(content,target,next);
   if(/(?:reviews|stats|badge|testimonials_h2)/.test(target))internalProofs.push({customer:slug,path:target,source_revision:revision,source_tenant:'tn90CyE3XuYFTy4c1M3F',source_file:candidate.refs.de.file,source_key:candidate.refs.de.key,decision:'User authorizes unlabelled UI; factual attribution/release review remains with user before publication',public_annotations_added:false});
  }
 }
 // Reuse existing project UI-status translations only; never generate new marketing translations.
 const previous=JSON.parse(fs.readFileSync(`docs/t08/${slug}/content.json`,'utf8'));
 content.availability={...(content.availability||{}),unavailable:previous.availability.unavailable,contact:previous.availability.contact};
 const assetBase=`https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/${id}/t08/v1/`;
 const audit=JSON.parse(fs.readFileSync(`${out}/T08-asset-live-audit.json`,'utf8'));
 for(const file of ['hero-angled.png','section-straight.png',...(slug==='tarivia'?['logo.png']:[])])if(!audit.assets.some(a=>a.customer===slug&&a.url===assetBase+file&&a.status==='PASS'))throw Error('ASSET_AUDIT_REQUIRED');
 desired.webseite_design_config.assets.hero_image=assetBase+'hero-angled.png';
 content.sections.solution.image_url=assetBase+'section-straight.png';
 if(slug==='tarivia')for(const key of ['logo_header','logo_footer'])desired.webseite_design_config.assets[key]=assetBase+'logo.png';
 const layout=desired.webseite_layout_config.pages.home.sections;
 if(layout.some(x=>typeof x!=='string')||new Set(layout).size!==layout.length)throw Error('EXPLICIT_LAYOUT_REVIEW_REQUIRED');
 const allow=['header','hero','problem','solution','how_it_works','comparison','testimonials','about','stats','faq','final_cta','footer'];
 if(layout.some(x=>!allow.includes(x)))throw Error('UNKNOWN_LAYOUT_SECTION');
 if(!layout.includes('final_cta'))layout.splice(layout.includes('footer')?layout.indexOf('footer'):layout.length,0,'final_cta');
 // The pinned annual page renders About -> FAQ directly, without a Stats module.
 const annual=desired.webseite_layout_config.pages.annual.sections;
 if(!Array.isArray(annual)||annual.some(x=>typeof x!=='string')||new Set(annual).size!==annual.length)throw Error('EXPLICIT_ANNUAL_LAYOUT_REVIEW_REQUIRED');
 if(!/<Stats(?:\s|\/|>)/.test(trees['src/pages/Jahresrechnung.tsx'].text))desired.webseite_layout_config.pages.annual.sections=annual.filter(id=>id!=='stats');
 const plan=prepareReviewPlan(before,desired,{verifiedAssetUrls:audit.assets.filter(a=>a.location_id===id&&a.status==='PASS').map(a=>a.url)});plan.customer=slug;plan.complete_12_locale_parity=false;plan.source_gaps=missing.filter(m=>m.customer===slug);plans.push(plan);snapshots.push(desired);
}
for(const row of rows)if(row.kind==='ARRAY_TEXT_LEAF'){
 row.customer_results=Object.entries(locations).map(([customer,id])=>{
  const config=snapshots.find(r=>r.location_id===id).webseite_content_config;
  const value=get(config,row.target_path);return {customer,planned_value:value??null,match:row.original_value!==null&&value!==undefined?digest(value)===row.value_sha256:null};
 });
}
// Personal reference About text is inventoried as an explicit tenant-identity exception.
for(const [key,value]of Object.entries(defaults.sections.about||{}))if(typeof value==='string'&&!/(?:url|image|social)/.test(key)){
 for(const [customer]of Object.entries(locations))for(const lang of languages)rows.push({customer,target_path:'webseite_content_config.sections.about',source_file:defFile,source_key:`sections.about.${key}`,source_lang:lang,source_revision:revision,source_file_sha256:sourceFiles[defFile].sha256,original_value:lang==='de'?value:null,value_sha256:lang==='de'?digest(value):null,planned_value:null,match:null,status:'TENANT_IDENTITY_PRESERVED',reason:'Reference personal identity/biography never replaces approved customer company content'});
}
// MASTER5: inventory evidence without substituting variant copy or dynamic translations.
const translatorFile='src/components/AutoPageTranslator.tsx';
const translatorTree=source(translatorFile);
const overrides=evalNode(variables[translatorFile].OVERRIDES,translatorTree);
const normalize=value=>value.replace(/\s+/g,' ').replace(/\s+([.,!?;:])/g,'$1').trim();
const typography=value=>normalize(value).replaceAll('’',"'");
const headingKeys={
 'sections.problem.headline':'home_problem_h2',
 'sections.solution.headline':'home_solution_h2',
 'sections.how_it_works.headline':'home_how_it_works_h2',
 'sections.comparison.headline':'home_comparison_h2',
 'sections.final_cta.headline':'home_final_cta_h2',
 'sections.testimonials.headline':'home_testimonials_h2',
 'sections.stats.headline':'home_testimonials_h2',
};
const staticOverrides=Object.entries(overrides).map(([german,values])=>({
 category:'C_STATIC_TRANSLATOR_OVERRIDE',source_file:translatorFile,source_revision:revision,
 source_file_sha256:sourceFiles[translatorFile].sha256,source_key:`OVERRIDES[${JSON.stringify(german)}]`,
 values:{de:german,...values},runtime_note:'Stored static literals; customer translator remains disabled. This is not a dynamic Google result.',
}));
const sourceClassification=[...new Set(missing.map(row=>row.target))].sort().map(target=>{
 const candidate=candidates.get(target),german=candidate.values.de;
 const exactStaticLeaves=[];
 function leaves(value,relative=''){
  if(typeof value==='string'&&!/\.(?:iconKey|step|suffix|name)$/.test(relative)){
   const found=translations(value);
   if(found)exactStaticLeaves.push({category:'A_EXACT_STATIC',relative_path:relative,original_value:value,source_file:catFile,source_key:`${catalogSource(found.key)}.${found.key}`,values:found.values});
  }else if(Array.isArray(value))value.forEach((item,index)=>leaves(item,`${relative}.${index}`));
  else if(value&&typeof value==='object')for(const[key,item]of Object.entries(value))leaves(item,`${relative}.${key}`);
 }
 leaves(candidate.originalArray||german);
 const key=headingKeys[target];
 const variant=key?{category:'B_STATIC_HEADING_DIFFERENT_GERMAN',source_file:catFile,source_key:`${catalogSource(key)}.${key}`,values:Object.fromEntries(languages.map(lang=>[lang,catalog[lang][key]])),german_equal:german===catalog.de[key],component_referenced:target!=='sections.stats.headline',transfer_allowed:false}:null;
 const relevantOverrides=typeof german==='string'?staticOverrides.filter(row=>typography(row.values.de)===typography(german)).map(row=>({...row,exact_german_match:row.values.de===german,runtime_normalized_match:normalize(row.values.de)===normalize(german),transfer_allowed:false})):[];
 return {target,kind:candidate.kind,selected_german_original:german,selected_source:candidate.refs.de,
  categories:[...(exactStaticLeaves.length?['A_EXACT_STATIC_LEAVES']:[]),...(variant?['B_STATIC_HEADING_DIFFERENT_GERMAN']:[]),...(relevantOverrides.length?['C_STATIC_TRANSLATOR_OVERRIDE_VARIANT']:[]),'D_NO_COMPLETE_STATIC_FOREIGN_SOURCE'],
  exact_static_leaves:exactStaticLeaves,static_heading_variant:variant,translator_override_candidates:relevantOverrides,
  foreign_source_status:'DYNAMIC_OR_MISSING_NOT_AUTHORITATIVELY_RECORDED',
  missing_languages:languages.filter(lang=>candidate.values[lang]===undefined),
  decision:'KEEP_OPEN; no semantic substitution, new translation, German locale fallback, or live translator call',
 };
});
const classificationSummary={schema:'T08_MASTER5_SOURCE_CLASSIFICATION',source_revision:revision,
 categories:{A:'Exact static original; only equal values can be transferred',B:'Static heading variant with a different selected German original; not transferable',C:'Persisted AutoPageTranslator override; separate from external dynamic output',D:'No complete static foreign original; dynamic rendering is not a persisted source'},
 unresolved_fields:sourceClassification.length,unique_missing_path_locales:new Set(missing.map(row=>`${row.target}:${row.lang}`)).size,missing_customer_path_locales:missing.length,
 static_translator_overrides:staticOverrides,fields:sourceClassification,
 dynamic_translation:{source_file:translatorFile,persisted_results_available:false,google_results_authoritative:false,customer_runtime_enabled:false},
 config_decision:'INVENTORY_ONLY; existing review patch and rollback unchanged; no additional translation/variant transfer',
};
const counts=Object.fromEntries([...new Set(rows.map(r=>r.status))].map(status=>[status,rows.filter(r=>r.status===status).length]));
const matrix={mode:'PINNED_ORIGINAL_SOURCE_TO_CONFIG_REVIEW_ONLY',baseline_code_sha:'5f4068551cb76395eceb03a4e877db2cfebec053',source_revision:revision,languages,sourceFiles,counts,complete_parity:false,live_ehiogie_config:baseline.find(r=>r.location_id==='tn90CyE3XuYFTy4c1M3F'),rows,missing_originals:missing,preserved_customer_exceptions:preserved,transfer_status:'PLANNED_CONFIG_VALUES_ONLY; NOT_WRITTEN_TO_SUPABASE; NO_REPO_MARKETING_FALLBACK',source_classification:classificationSummary,rating_provenance:'rating=5 copied from five-star rendering in pinned Testimonials/Jahresrechnung components; existing names/text unchanged'};
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(`${out}/T08-source-parity-v2.json`,JSON.stringify(matrix,null,2)+'\n');
fs.writeFileSync(`${out}/T08-config-plan-REVIEW-ONLY.json`,JSON.stringify({mode:'REVIEW_ONLY_NOT_AUTHORIZED_FOR_EXECUTION',source_revision:revision,complete_parity:false,public_labels_added:false,source_decisions:classificationSummary,marketing_evidence:internalProofs,protected_customer_exceptions:preserved,plans},null,2)+'\n');
fs.writeFileSync(`${out}/proposed-local-configs.json`,JSON.stringify(snapshots,null,2)+'\n');
console.log(JSON.stringify({rows:rows.length,counts,missing:missing.length,plans:plans.map(p=>({customer:p.customer,changes:p.changes.length,baseline_sha256:p.baseline_sha256}))}));
