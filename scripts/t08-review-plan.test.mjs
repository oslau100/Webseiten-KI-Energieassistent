import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareReviewPlan} from './t08-review-plan.mjs';
const fixture=()=>({location_id:'NPhuVMAaBPQz6OhIPpkj',webseite_content_config:{legal:{ready:true,variables:{firma:'Protected'}},brand:{name:'Protected'},sections:{hero:{headline:{de:'Old'}}}},webseite_design_config:{assets:{hero_image:'/old.png'}},webseite_layout_config:{pages:{home:{sections:['header','hero','footer']}}}});
function apply(row,ops){let current=structuredClone(row);for(const op of ops){if(op.path===''){assert.equal(op.op,'test');assert.deepEqual(current,op.value);continue;}const parts=op.path.slice(1).split('/').map(p=>p.replaceAll('~1','/').replaceAll('~0','~'));const key=parts.pop();let parent=current;for(const p of parts)parent=parent[p];if(op.op==='test')assert.deepEqual(parent[key],op.value);else if(op.op==='remove')delete parent[key];else parent[key]=structuredClone(op.value);}return current;}
test('leaf patch round-trips additions, replacements and layout, preserving legal/identity',()=>{
 const before=fixture(),after=fixture();after.webseite_content_config.sections.hero.headline={de:'Original',en:'Source'};after.webseite_layout_config.pages.home.sections.splice(2,0,'final_cta');
 const plan=prepareReviewPlan(before,after);assert.deepEqual(apply(before,plan.patch),after);assert.deepEqual(apply(after,plan.rollback),before);
 assert.ok(plan.changes.every(o=>o.path!==''));assert.ok(plan.changes.some(o=>o.op==='add'));
 const drift=fixture();drift.webseite_content_config.brand.name='Changed';assert.throws(()=>apply(drift,plan.patch));
});
test('refuses cross-location, legal, identity, unscoped assets, integration, unknown paths and removals',()=>{
 for(const mutate of [r=>r.location_id='wrong',r=>r.webseite_content_config.legal.ready=false,r=>r.webseite_content_config.brand.name='Foreign',r=>r.webseite_design_config.assets.logo_other='/foreign.png',r=>r.webseite_content_config.integrations={secret:'no'},r=>delete r.webseite_content_config.brand]){
  const before=fixture(),after=fixture();mutate(after);assert.throws(()=>prepareReviewPlan(before,after));
 }
});
test('requires an independently verified asset URL for the exact Location',()=>{
 const before=fixture(),after=fixture();const url=`https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/${before.location_id}/t08/v1/hero-angled.png`;after.webseite_design_config.assets.hero_image=url;
 assert.throws(()=>prepareReviewPlan(before,after),/VERIFIED_LOCATION_ASSET_REQUIRED/);
 assert.doesNotThrow(()=>prepareReviewPlan(before,after,{verifiedAssetUrls:[url]}));
 after.webseite_design_config.assets.hero_image=url.replace(before.location_id,'uGJsQ3CWvFTraTfrRgjC');
 assert.throws(()=>prepareReviewPlan(before,after,{verifiedAssetUrls:[after.webseite_design_config.assets.hero_image]}));
});
