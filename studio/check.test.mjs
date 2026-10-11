import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHandler, validateEnquiry } from '../api/contact.js';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const valid = {
  name: 'Preview Test',
  email: 'preview@example.com',
  subject: 'New project',
  message: 'A local test message that is never delivered.',
  website: '',
};
const allowLimiter = { limit: async () => ({ success: true, remaining: 4, reset: Date.now() + 600_000 }) };
const request = body => ({ method: 'POST', headers: { 'x-forwarded-for': '203.0.113.5' }, body });

function response() {
  return {
    code: 200,
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.code = code; return this; },
    json(value) { this.data = value; return this; },
  };
}

test('enquiries reject injection, invalid fields and bot submissions', () => {
  assert.equal(validateEnquiry({ ...valid, email: 'invalid' }), null);
  assert.equal(validateEnquiry({ ...valid, subject: 'Project\nBcc: other@example.com' }), null);
  assert.equal(validateEnquiry({ ...valid, website: 'bot' }), null);
  assert.equal(validateEnquiry({ ...valid, message: 'short' }), null);
  assert.equal(validateEnquiry({ ...valid, message: 'x'.repeat(5001) }), null);
  assert.equal(validateEnquiry(valid).email, valid.email);
});

test('contact endpoint applies shared per-IP rate limiting and fails closed', async () => {
  const prior = process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-only-secret';
  try {
    let identifier;
    const blocked = response();
    await createHandler(
      () => assert.fail('Rate-limited enquiries must not send'),
      undefined,
      { limit: async key => { identifier = key; return { success: false, remaining: 0, reset: Date.now() + 30_000 }; } },
    )(request(valid), blocked);
    assert.equal(blocked.code, 429);
    assert.ok(Number(blocked.headers['Retry-After']) >= 1);
    assert.notEqual(identifier, '203.0.113.5');

    const unavailable = response();
    await createHandler(() => assert.fail('Unavailable limiter must block sends'), undefined, {
      limit: async () => { throw new Error('Redis unavailable'); },
    })(request(valid), unavailable);
    assert.equal(unavailable.code, 503);

    const noConfiguration = response();
    await createHandler(() => assert.fail('Missing limiter config must block sends'), undefined, null)(request(valid), noConfiguration);
    assert.equal(noConfiguration.code, 503);
  } finally {
    if (prior === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN;
    else process.env.UPSTASH_REDIS_REST_TOKEN = prior;
  }
});

test('contact reports only provider-confirmed acceptance; no external email is sent', async () => {
  const prior = {
    key: process.env.RESEND_API_KEY,
    from: process.env.RESEND_FROM_EMAIL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  };
  try {
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-only-secret';
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;

    const disabled = response();
    await createHandler(() => assert.fail('Must not send'), undefined, allowLimiter)(request(valid), disabled);
    assert.equal(disabled.code, 503);

    const method = response();
    await createHandler()({ method: 'GET' }, method);
    assert.equal(method.code, 405);

    const invalid = response();
    await createHandler(undefined, undefined, allowLimiter)(request('not json'), invalid);
    assert.equal(invalid.code, 400);

    process.env.RESEND_API_KEY = 'test-only';
    process.env.RESEND_FROM_EMAIL = 'test@example.com';
    for (const outcome of [{ error: { message: 'rejected' } }, { data: {} }, null]) {
      const res = response();
      await createHandler(async () => outcome, undefined, allowLimiter)(request(valid), res);
      assert.equal(res.code, 502);
      assert.equal(res.data.success, false);
    }

    let archived = false;
    const res = response();
    await createHandler(
      async payload => { assert.equal(payload.replyTo, valid.email); return { data: { id: 'local-mock' } }; },
      async data => { assert.equal(data.message, valid.message); archived = true; },
      allowLimiter,
    )(request(valid), res);
    assert.equal(res.code, 200);
    assert.equal(res.data.success, true);
    assert.equal(archived, true);
  } finally {
    for (const [key, value] of [
      ['RESEND_API_KEY', prior.key],
      ['RESEND_FROM_EMAIL', prior.from],
      ['UPSTASH_REDIS_REST_TOKEN', prior.token],
    ]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('all public HTML pages have complete metadata, local assets and working internal links', async () => {
  const files = (await readdir(root, { recursive: true }))
    .filter(file => file.endsWith('.html') && !file.startsWith(`legacy${path.sep}`) && file !== '404.html');
  assert.equal(files.length, 16);
  for (const file of files) {
    const html = await readFile(path.join(root, file), 'utf8');
    assert.equal((html.match(/<h1>/g) || []).length, 1, file);
    for (const snippet of [
      'name="description"',
      'rel="canonical"',
      'application/ld+json',
      '"@type":"WebSite"',
      'rel="alternate" type="application/json" href="/site-data.json"',
      'rel="alternate" type="text/plain" href="/llms.txt"',
      'id="main"',
    ]) assert.ok(html.includes(snippet), `${file}: ${snippet}`);
    for (const match of html.matchAll(/(?:href|src)="(\/[^\"]*)"/g)) {
      const url = new URL(match[1], 'https://oddwebs.com');
      let target = path.join(root, decodeURIComponent(url.pathname));
      if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
      assert.ok((await stat(target)).isFile(), `${file}: ${match[1]}`);
      if (url.hash) {
        const destination = await readFile(target, 'utf8');
        assert.ok(destination.includes(`id="${url.hash.slice(1)}"`), `${file}: missing ${url.hash}`);
      }
    }
    assert.ok(!/InventoryAvangers|BizzHouse|320%|99\.4%|4\.9\/5/.test(html), `${file}: unsupported/private content`);
  }
});

test('AI discovery files expose structured public data without private work records', async () => {
  const siteData = JSON.parse(await readFile(path.join(root, 'site-data.json'), 'utf8'));
  const serialized = JSON.stringify(siteData);
  assert.equal(siteData.schemaVersion, 'oddwebs.public-site-data/v1');
  assert.equal(siteData.organization.name, 'Oddwebs');
  assert.deepEqual(siteData.products.map(product => product.name), ['Odd Ecosys', 'Odd Form', 'Oddbroadcast']);
  assert.equal(siteData.products.find(product => product.name === 'Oddbroadcast').stage, 'In development');
  assert.equal(siteData.publicWork.length, 5);
  assert.equal(siteData.pages.length, 16);
  assert.ok(!/inventory|confidential|InventoryAvangers|BizzHouse/i.test(serialized));

  const llms = await readFile(path.join(root, 'llms.txt'), 'utf8');
  assert.ok(llms.includes('https://oddwebs.com/site-data.json'));
  assert.ok(llms.includes('Oddwebs is independent'));
  assert.ok(llms.includes('illustrative'));
  assert.ok(!/inventory|confidential|InventoryAvangers|BizzHouse/i.test(llms));

  const robots = await readFile(path.join(root, 'robots.txt'), 'utf8');
  assert.ok(robots.includes('Allow: /site-data.json'));
  assert.ok(robots.includes('Allow: /llms.txt'));
  assert.ok(robots.includes('Disallow: /api/'));

  const vercel = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  for (const source of ['/site-data.json', '/llms.txt']) {
    const route = vercel.headers.find(item => item.source === source);
    assert.ok(route, `${source}: deployment route headers`);
    assert.equal(route.headers.find(header => header.key === 'Access-Control-Allow-Origin')?.value, '*');
  }
});
