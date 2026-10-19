import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {digest} from './t08-review-plan.mjs';
const dir='.codex-local/t08-output/followup';
const read=name=>JSON.parse(fs.readFileSync(`${dir}/${name}`,'utf8'));
const matrix=read('T08-source-parity-v2.json'),review=read('T08-config-plan-REVIEW-ONLY.json');
const classification=matrix.source_classification;
test('all 33 gaps are classified without inventing any of the 726 missing values',()=>{
 assert.equal(classification.fields.length,33);
 assert.equal(new Set(classification.fields.map(row=>row.target)).size,33);
 assert.equal(classification.unique_missing_path_locales,363);
 assert.equal(classification.missing_customer_path_locales,726);
 assert.equal(matrix.complete_parity,false);
 for(const field of classification.fields){
  assert.deepEqual(field.missing_languages,matrix.languages.slice(1));
  assert.ok(field.categories.includes('D_NO_COMPLETE_STATIC_FOREIGN_SOURCE'));
  if(field.static_heading_variant){assert.equal(field.static_heading_variant.german_equal,false);assert.equal(field.static_heading_variant.transfer_allowed,false);}
 }
});
test('static translator overrides are preserved as literals, not attributed to Google results',()=>{
 assert.equal(classification.static_translator_overrides.length,7);
 for(const row of classification.static_translator_overrides){assert.equal(Object.keys(row.values).length,12);assert.equal(row.source_revision,matrix.source_revision);assert.ok(row.source_file_sha256);}
 const how=classification.fields.find(row=>row.target==='sections.how_it_works.headline');
 assert.equal(how.translator_override_candidates.length,1);
 assert.equal(how.translator_override_candidates[0].exact_german_match,false);
 assert.equal(how.translator_override_candidates[0].runtime_normalized_match,false);
 assert.equal(classification.dynamic_translation.google_results_authoritative,false);
 assert.equal(classification.dynamic_translation.customer_runtime_enabled,false);
});
test('partial exact FAQ originals do not make an incomplete translated array complete',()=>{
 const faq=classification.fields.find(row=>row.target==='sections.faq.home_items');
 assert.equal(faq.exact_static_leaves.length,2);
 assert.deepEqual(new Set(faq.exact_static_leaves.map(row=>row.source_key)),new Set(['annualFaqDictionaries.annual_faq_2_q','annualFaqDictionaries.annual_faq_6_q']));
 for(const row of faq.exact_static_leaves)assert.equal(row.original_value,row.values.de);
});
test('408 proposed config changes, exact sources, baseline guards and rollback survive classification unchanged',()=>{
 const previous=JSON.parse(fs.readFileSync('.codex-local/t08-output/master5/before/followup/T08-config-plan-REVIEW-ONLY.json','utf8'));
 assert.deepEqual(review.plans,previous.plans);
 assert.equal(review.plans.reduce((sum,plan)=>sum+plan.changes.length,0),408);
 assert.deepEqual(review.source_decisions,classification);
 const oldMatrix=JSON.parse(fs.readFileSync('.codex-local/t08-output/master5/before/followup/T08-source-parity-v2.json','utf8'));
 assert.deepEqual(matrix.rows,oldMatrix.rows);
 for(const row of matrix.rows)if(row.planned_value!==null&&row.planned_value!==undefined){assert.equal(digest(row.planned_value),row.value_sha256);assert.equal(row.match,true);}
 const snapshots=read('proposed-local-configs.json'),baseline=read('live-config-baseline.json');
 function apply(document,ops){let result=structuredClone(document);for(const op of ops){if(op.path===''){assert.equal(op.op,'test');assert.deepEqual(result,op.value);continue;}const parts=op.path.slice(1).split('/').map(s=>s.replaceAll('~1','/').replaceAll('~0','~'));const key=parts.pop();let parent=result;for(const part of parts)parent=parent[part];if(op.op==='test')assert.deepEqual(parent[key],op.value);else if(op.op==='remove')delete parent[key];else parent[key]=structuredClone(op.value);}return result;}
 for(const plan of review.plans){const before=baseline.find(row=>row.location_id===plan.location_id),after=snapshots.find(row=>row.location_id===plan.location_id);assert.equal(digest(before),plan.baseline_sha256);assert.equal(digest(after),plan.result_sha256);assert.deepEqual(apply(before,plan.patch),after);assert.deepEqual(apply(after,plan.rollback),before);}
});
