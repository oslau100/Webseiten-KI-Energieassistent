import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const targets=[['oecher-strom','NPhuVMAaBPQz6OhIPpkj'],['tarivia','uGJsQ3CWvFTraTfrRgjC']];
const proposed=targets.map(([slug,locationId])=>({location_id:locationId,buckets:Object.fromEntries(['content','design','layout'].map(bucket=>{
 const path=`docs/t08/${slug}/${bucket}.json`;const bytes=readFileSync(path);
 return [`webseite_${bucket}_config`,{usage:'REFERENCE_DRAFT_ONLY_NEVER_REPLACE_LIVE_BUCKET',path,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}];
}))}));
const manifest={
 version:2,production_buckets_apply_forbidden:true,safe_diff_preparer:'scripts/t08-safe-config-diff.mjs',production_plan:'docs/t08/production-correction-plan.json',expected_source_sha:'64de44796d15dc0328b339f8e0621a455af90ad6',mode:'REVIEW_ONLY_NO_SQL_EXECUTED',
 release_ready:false,live_baseline_available:false,proposed,
 prerequisites:[
  'Obtain separately approved exact read-only snapshot of the three website config buckets for each exact Location; no unrelated kunden_config columns.',
  'Compare approved live snapshot to proposed files, not historical draft JSON. Review every added/removed/changed JSON path and generate an exact per-Location payload diff.',
  'All 92 prior gaps now have faithful translations from existing German text under user authorisation. Review language quality separately; source-copy exclusions still apply.',
  'Preserve independently approved live legal.ready and verified public asset URLs. Archived legal.ready=false and symbolic draft URLs are not production payloads.',
  'Verify original image hashes, approved legal HTML, tenant isolation and preview rendering without activating funnel transports.',
  'Complete Vitest, changed-file ESLint, TypeScript and Vite build in a dependency-equipped environment.',
 ],
 future_apply_contract:[
  'Only after separate explicit approval of exact final payloads and hashes: scope to the two exact Location IDs and only the three website config columns.',
  'Use a transaction with row locks and exact equality preconditions against the reviewed baseline. Require exactly one target row per Location; abort on any drift or mismatch.',
  'Capture encrypted, access-controlled before-images and expected after-images. No contacts/orders/customer records in this website payload.',
  'Do not modify calendars, CRM, RLS, schema, Storage or Cloudflare. Calendar provisioning and public config exposure are separate scopes.',
 ],
 rollback_contract:[
  'Prepare parameterized restore values from captured before-images; never invent the original live values from draft files.',
  'Restore only the same three columns and two exact Location IDs, with equality preconditions against applied after-images; abort if subsequent changes occurred.',
  'Review restoration diff and hashes before separate rollback authorization. No executable UPDATE or migration is supplied here.',
 ],
 blockers:['Unsupported reference claims intentionally excluded','Live baseline absent','Archived assets symbolic and legal draft unapproved','Production calendar absence is supplied audit evidence, not a new live query','Application toolchain unavailable offline'],
};
writeFileSync('docs/t08/config-review-manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Saved review-only config/rollback manifest; no database or network access.');
