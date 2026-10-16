/** Offline, leaf-scoped review plans only. No database/network/execution capability. */
import {createHash} from 'node:crypto';
const ids=new Set(['NPhuVMAaBPQz6OhIPpkj','uGJsQ3CWvFTraTfrRgjC']);
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const clone=v=>structuredClone(v);
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])])):value;
export const digest=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(canonical(value))).digest('hex');
const escape=s=>s.replaceAll('~','~0').replaceAll('/','~1');
const editable=p=>/^\/webseite_content_config\/(?:i18n\/|availability(?:\/|$)|sections\/(?:hero|problem|solution|how_it_works|comparison|testimonials|stats|faq|final_cta|jahresrechnung)\/)/.test(p)||/^\/webseite_design_config\/assets\/(?:hero_image|logo_header|logo_footer)$/.test(p)||/^\/webseite_layout_config\/pages\/(?:home|annual)\/sections$/.test(p);
function changes(before,after,path='',out=[]){
 if(equal(before,after))return out;
 if(before&&after&&typeof before==='object'&&typeof after==='object'&&!Array.isArray(before)&&!Array.isArray(after)){
  for(const [key,value]of Object.entries(after)){
   const p=`${path}/${escape(key)}`;
   if(!(key in before))out.push({op:'add',path:p,value:clone(value)});else changes(before[key],value,p,out);
  }
  for(const key of Object.keys(before))if(!(key in after))throw Error('UNREVIEWED_REMOVAL');
 }else out.push({op:'replace',path,value:clone(after),old_value:clone(before)});
 return out;
}
export function prepareReviewPlan(before,after,{verifiedAssetUrls=[]}={}){
 if(!ids.has(before.location_id)||before.location_id!==after.location_id)throw Error('LOCATION_MISMATCH');
 if(before.webseite_content_config?.legal?.ready!==true)throw Error('APPROVED_LEGAL_BASELINE_REQUIRED');
 const diff=changes(before,after);
 for(const op of diff)if(!editable(op.path)||/\/(?:__proto__|prototype|constructor)(?:\/|$)/.test(op.path))throw Error(`PROTECTED_PATH:${op.path}`);
 for(const op of diff)if(/^\/webseite_design_config\/assets\/|^\/webseite_content_config\/sections\/solution\/image_url(?:\/|$)/.test(op.path)){
  const file=op.path.endsWith('/hero_image')?'hero-angled.png':op.path.includes('/solution/')?'section-straight.png':'logo.png';
  const expected=`https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/${before.location_id}/t08/v1/${file}`;
  if(op.value!==expected||!verifiedAssetUrls.includes(op.value))throw Error('VERIFIED_LOCATION_ASSET_REQUIRED');
 }
 const rollback=[];const patch=[{op:'test',path:'',value:clone(before)}];
 for(const op of diff){
  if(op.op==='replace')patch.push({op:'test',path:op.path,value:op.old_value});
  patch.push({op:op.op,path:op.path,value:op.value});
  rollback.unshift(op.op==='add'?{op:'remove',path:op.path}:{op:'replace',path:op.path,value:op.old_value});
 }
 return {mode:'REVIEW_ONLY_NOT_AUTHORIZED_FOR_EXECUTION',hash_algorithm:'SHA256 of canonical JSON (sorted object keys, array order preserved); string values use raw UTF-8',location_id:before.location_id,baseline_sha256:digest(before),result_sha256:digest(after),changes:diff,patch,rollback:[{op:'test',path:'',value:clone(after)},...rollback]};
}
