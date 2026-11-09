import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash, createHmac, webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { handlePinnedV1SettingRequest as relay, signTenantBoundBody } from '../../functions/_shared/v1-tariff-relay';
import { onRequestPost } from '../../functions/api/v1/setting';

const location = 'uuDEvEGcyd3mMiKWKH4Z';
const key = Buffer.alloc(32, 17).toString('base64url');
const env = { TARIFF_TENANT_PROOF_KEY_B64URL: key, V1_EWV_SUPABASE_ANON_JWT: 'test.anon.jwt' };
const body = { meta: { location_id: location }, answer: 'test' };
const request = (value: unknown = body, headers = {}) => new Request('https://example.test/api/v1/setting', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(value),
});
vi.stubGlobal('crypto', webcrypto);

describe('Öcher V1 signed relay', () => {
  it('signs the exact body with tenant, audience and a 60 second lifetime', async () => {
    const upstream = vi.fn(async () => new Response('{"ok":true}'));
    expect((await relay(request(), env, location, upstream, 1000)).status).toBe(200);
    const [url, init] = upstream.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://oynhnhkldvpoqhsfirwf.supabase.co/functions/v1/setting-proxy');
    expect(init.redirect).toBe('manual');
    expect(init.body).toBe(JSON.stringify(body));
    const proof = new Headers(init.headers).get('x-v1-tariff-tenant-proof')!;
    const [version, payload, signature] = proof.split('.');
    expect(version).toBe('v1');
    expect(signature).toBe(createHmac('sha256', Buffer.from(key, 'base64url')).update(`${version}.${payload}`).digest('base64url'));
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString());
    expect(claims).toEqual({ v: 1, aud: 'setting-proxy:regional-tariff-v1', location_id: location,
      body_sha256: createHash('sha256').update(String(init.body)).digest('base64url'), iat: 1000, exp: 1060 });
    expect(claims.body_sha256).not.toBe(createHash('sha256').update(JSON.stringify({ ...body, answer: 'changed' })).digest('base64url'));
    expect(await signTenantBoundBody(body, location, key, 1000)).toBe(proof);
  });

  it.each(['NPhuVMAaBPQz6OhIPpkj', 'Ehiogie', 'abcdefghijklmnopqrst'])('blocks foreign tenant %s without upstream calls', async foreign => {
    const upstream = vi.fn();
    expect((await relay(request({ meta: { location_id: foreign } }), env, location, upstream)).status).toBe(403);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('pins the actual Pages route to V1', async () => {
    expect((await onRequestPost({ request: request({ meta: { location_id: 'NPhuVMAaBPQz6OhIPpkj' } }), env })).status).toBe(403);
  });

  it('rejects malformed, oversized and untrusted requests before forwarding', async () => {
    const upstream = vi.fn();
    const cases: [Request, typeof env | {}, number][] = [
      [new Request('https://example.test', { method: 'GET' }), env, 405],
      [request(), {}, 503],
      [request({}, { 'Content-Type': 'text/plain' }), env, 415],
      [request({}, { Origin: 'https://foreign.test' }), env, 403],
      [request(body, { 'x-v1-tariff-tenant-proof': 'forged' }), env, 400],
      [new Request('https://example.test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }), env, 400],
      [request({ padding: 'x'.repeat(262145) }), env, 413],
      [request(null), env, 400], [request({}), env, 400],
    ];
    for (const [req, config, status] of cases) {
      const response = await relay(req, config, location, upstream);
      expect(response.status).toBe(status);
      expect(await response.text()).not.toContain(key);
    }
    expect(upstream).not.toHaveBeenCalled();
  });

  it('blocks redirects and hides exception details and secrets', async () => {
    expect((await relay(request(), env, location, async () => new Response(null, { status: 302, headers: { Location: 'https://foreign.test' } }))).status).toBe(502);
    const response = await relay(request(), env, location, async () => { throw new Error(key + env.V1_EWV_SUPABASE_ANON_JWT); });
    expect(response.status).toBe(502);
    expect(await response.text()).toBe('{"ok":false,"error_code":"relay_upstream_failed"}');
  });

  it('keeps the loaded loader pinned despite a foreign runtime URL', async () => {
    const html = readFileSync('public/loaders/start.html', 'utf8');
    const dom = new JSDOM(html, { url: 'https://example.test/start', runScripts: 'outside-only' });
    const w = dom.window;
    const single = vi.fn(async () => ({ data: { runtime_config: { setting_proxy_path: 'https://foreign.test/proxy' } }, error: null }));
    (w as any).supabase = { createClient: () => ({ from: () => ({ select: () => ({ eq: () => ({ single }) }) }) }) };
    (w as any).fetch = vi.fn(async () => ({ text: async () => '' }));
    const scripts = [...w.document.querySelectorAll('script:not([src])')];
    w.eval(scripts[0].textContent!);
    expect((w as any).TB_BOOTSTRAP.settingProxyPath).toBe('/api/v1/setting');
    await w.eval(scripts[1].textContent!);
    expect(single).toHaveBeenCalledOnce();
    expect((w as any).SURVEY_CONFIG.settingProxyPath).toBe('/api/v1/setting');
    dom.window.close();
  });
});
