/* Runs the real pure TS modules with Node's test runner when frontend packages are unavailable.
 * Usage: W1_TYPESCRIPT_MODULE=/absolute/path/to/typescript node scripts/signing-offline.test.cjs
 * No mocks of contract validation, PDF verification, readiness, branding or draft semantics.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require(process.env.W1_TYPESCRIPT_MODULE || 'typescript');
require.extensions['.ts'] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
  }, fileName: filename, reportDiagnostics: true });
  assert.equal(result.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length || 0, 0, filename);
  module._compile(result.outputText, filename);
};
const contract = require('../src/lib/signing/contract.ts');
const draft = require('../src/lib/signing/presentation.ts');
const { resolveSigningBrand } = require('../src/lib/signing/brand.ts');
const { signingTranslations } = require('../src/lib/signing/i18n.ts');
const { customerRuntimeBindings } = require('../src/lib/customerRuntime.ts');
const { customerRouteAvailable } = require('../src/lib/customerFunnel.ts');
const { signingFixture, signingBrandFixture, fixtureHash } = require('../src/test/signingFixtures.ts');
const locales = ['de','en','tr','ru','ar','it','zh','hi','es','fr','nl','pl'];
const keys = Object.keys(signingTranslations.de).sort();
for (const brand of ['tarivia','oecher','demo','ehiogie']) for (const lang of locales) test(`${brand}/${lang}: synthetic brand projection, locale coverage, public gate`, () => {
  const location = brand === 'tarivia' ? customerRuntimeBindings[1].locationId : brand === 'oecher' ? customerRuntimeBindings[0].locationId : undefined;
  assert.equal(resolveSigningBrand(brand, signingBrandFixture(brand), location)?.key, brand);
  assert.deepEqual(Object.keys(signingTranslations[lang]).sort(), keys);
  assert.ok(Object.values(signingTranslations[lang]).every(value => typeof value === 'string' && value.trim()));
  assert.ok(contract.parseSigningManifest(signingFixture(brand)));
  assert.equal(customerRouteAvailable('/signing', { features: { signing: true, order_funnel: true } }), false);
});
test('exact twelve languages and all UI translation keys exist', () => {
  assert.deepEqual(Object.keys(signingTranslations), locales);
  const files = ['src/components/signing/SigningShell.tsx','src/components/signing/SignaturePad.tsx'];
  for (const file of files) for (const match of fs.readFileSync(path.join(__dirname,'..',file),'utf8').matchAll(/"(signing_[a-zA-Z_]+)"/g)) assert.ok(keys.includes(match[1]), match[1]);
});
for (const reason of ['missing-config','legal-not-ready','missing-logo','missing-color','missing-support','foreign-brand','foreign-location']) test(`brand fail closed: ${reason}`, () => {
  const config = signingBrandFixture('tarivia');
  if (reason === 'missing-config') config.content = {};
  if (reason === 'legal-not-ready') config.content.legal.ready = false;
  if (reason === 'missing-logo') config.design.assets.logo_header = '';
  if (reason === 'missing-color') config.design.colors = {};
  if (reason === 'missing-support') config.content.brand.contact_email = '';
  if (reason === 'foreign-brand') config.content.brand.name = 'Ehiogie';
  assert.equal(resolveSigningBrand('tarivia', config, customerRuntimeBindings[reason === 'foreign-location' ? 0 : 1].locationId), null);
});
test('checked-in customer draft configs remain unreleased; no brand approval invented', () => {
  for (const brand of ['tarivia','oecher-strom']) {
    const folder = path.join(__dirname,'../docs/t08',brand);
    const config = Object.fromEntries(['content','design','layout'].map(key => [key,JSON.parse(fs.readFileSync(path.join(folder,key+'.json'),'utf8'))]));
    assert.equal(resolveSigningBrand(brand === 'tarivia' ? 'tarivia' : 'oecher',config,customerRuntimeBindings[brand === 'tarivia' ? 1 : 0].locationId), null);
  }
});
const mutations = {
  'missing session': m => delete m.sessionId,
  'unknown role': m => m.participants[0].role = 'advisor',
  'duplicate participant': m => m.participants.push(m.participants[0]),
  'duplicate declaration': m => m.requirements.push(m.requirements[0]),
  'foreign participant': m => m.requirements[0].participantId = 'foreign-person',
  'missing participant declaration': m => m.requirements = m.requirements.slice(0,2),
  'unknown slot': m => m.requirements[0].slot = 'invented',
  'no required declaration': m => m.requirements.forEach(r => r.required = false),
  'bundled marketing': m => m.requirements[0].slot = 'optional_marketing_consent_signature',
  'empty legal text': m => m.requirements[0].text = '',
  'bad hash': m => m.document.sha256 = 'fake',
  'bad expiry': m => m.expiresAt = 'never',
  'live demo': m => m.mode = 'LIVE',
  'public PDF URL': m => m.document.url = 'https://example.test/public.pdf',
  'browser auth flag': m => m.authorized = true,
  'missing requirement version': m => delete m.requirementVersion,
};
for (const [name, mutate] of Object.entries(mutations)) test(`reject manifest: ${name}`, () => {
  const m = signingFixture(); mutate(m); assert.equal(contract.parseSigningManifest(m), null);
});
test('drawing alone never satisfies declarations or another person', () => {
  const m = signingFixture(); const state = draft.emptySigningDraft();
  const a = m.participants[0].id, b = m.participants[1].id;
  state.reviewed[a] = true;
  state.strokes[draft.captureKey(m.requirements[0])] = [[[0,0],[40,20]]];
  assert.equal(draft.participantComplete(m,state,a), false);
  state.confirmations[m.requirements[0].id] = true;
  assert.equal(draft.participantComplete(m,state,a), false);
  state.confirmations[m.requirements[1].id] = true;
  assert.equal(draft.participantComplete(m,state,a), true);
  state.reviewed[b] = true; state.confirmations[m.requirements[2].id] = true;
  assert.equal(draft.participantComplete(m,state,b), false);
  state.strokes[draft.captureKey(m.requirements[2])] = [[[20,20],[60,30]]];
  assert.equal(draft.participantComplete(m,state,b), true);
  const cleared = draft.changeDrawing(m,state,draft.captureKey(m.requirements[0]),[]);
  assert.equal(draft.participantComplete(m,cleared,a), false);
  assert.equal(cleared.confirmations[m.requirements[0].id], undefined);
  assert.equal(cleared.confirmations[m.requirements[1].id], undefined);
  assert.equal(draft.participantComplete(m,cleared,b), true);
  assert.equal(draft.participantComplete(m,cleared,'foreign'), false);
});
test('separate captures are enforced; optional consent does not block', () => {
  const m = signingFixture(); const state = draft.emptySigningDraft(); const person = m.participants[0].id;
  m.requirements[1].capture = 'separate'; state.reviewed[person] = true;
  state.confirmations[m.requirements[0].id] = state.confirmations[m.requirements[1].id] = true;
  state.strokes[draft.captureKey(m.requirements[0])] = [[[0,0],[40,20]]];
  assert.equal(draft.participantComplete(m,state,person), false);
  m.requirements[1].required = false;
  assert.equal(draft.participantComplete(m,state,person), true);
  assert.equal(draft.hasDrawing([[[0,0],[0,0]]]), false);
});
test('inactive ports do not fetch or accept browser authorization', async () => {
  const previous = global.fetch;
  global.fetch = () => { throw Error('unexpected fetch'); };
  try {
    assert.deepEqual(await contract.inactiveSigningServer.loadSession(new AbortController().signal), { status:'unavailable',reason:'not_wired' });
    assert.deepEqual(await contract.inactiveSigningServer.finalize({ authorized:true,uuid:'fake' }), { status:'unavailable',reason:'not_wired' });
    assert.deepEqual(await contract.inactiveSigningServer.captureSignature({ participantId: 'fake' }), { status:'unavailable',reason:'not_wired' });
    await assert.rejects(contract.inactiveSigningServer.readPrivatePdf('fake'), /SIGNING_NOT_WIRED/);
  } finally { global.fetch = previous; }
});
test('PDF bytes, MIME, exact hash and missing bytes fail closed', async () => {
  const blob = new Blob(['%PDF-1.4\nSYNTHETIC TEST ONLY - NOT A CONTRACT'], {type:'application/pdf'});
  const digest = require('node:crypto').createHash('sha256').update(Buffer.from(await blob.arrayBuffer())).digest('hex');
  assert.equal(await contract.verifyPrivatePdf(blob,digest), true);
  assert.equal(await contract.verifyPrivatePdf(undefined,digest), false);
  assert.equal(await contract.verifyPrivatePdf(blob,fixtureHash), false);
  assert.equal(await contract.verifyPrivatePdf(new Blob(['%PDF-1.4'],{type:'text/html'}),digest), false);
  assert.equal(await contract.verifyPrivatePdf(new Blob(['NOT A PDF'],{type:'application/pdf'}),digest), false);
  assert.equal(await contract.verifyPrivatePdf(new Blob([],{type:'application/pdf'}),digest), false);
});

test('non-finite or out-of-bounds capture samples never count as a drawing', () => {
  assert.equal(draft.hasDrawing([[[0,0],[Infinity,0]]]), false);
  assert.equal(draft.hasDrawing([[[0,0],[601,0]]]), false);
  assert.equal(draft.hasDrawing([[[0,0],[NaN,0]]]), false);
});

test('an optional-only participant does not block the required review', () => {
  const m = signingFixture(); const state = draft.emptySigningDraft();
  for (const r of m.requirements) {
    state.reviewed[r.participantId] = true;
    state.confirmations[r.id] = true;
    state.strokes[draft.captureKey(r)] = [[[0,0],[40,20]]];
  }
  m.participants.push({id:'optional-person',displayName:'TEST OPTIONAL',role:'customer'});
  m.requirements.push({...m.requirements[0],id:'optional-marketing',participantId:'optional-person',slot:'optional_marketing_consent_signature',required:false});
  assert.ok(contract.parseSigningManifest(m));
  assert.equal(draft.requiredReviewComplete(m,state), true);
  delete state.confirmations[m.requirements[0].id];
  assert.equal(draft.requiredReviewComplete(m,state), false);
});
