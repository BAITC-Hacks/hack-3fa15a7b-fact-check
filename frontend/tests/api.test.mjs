import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AxiosError } from 'axios';

// Never use the developer's .env or make real network requests.
process.env.EXPO_PUBLIC_API_URL = 'https://api.example.test';
process.env.EXPO_PUBLIC_RECOMMENDATIONS_PATH = '/recommendations';
const { api, getRecommendations } = await import('../src/services/api.js');
const payload = { city: 'Алматы', date: '2026-10-19', category: 'Ведущий', event_type: 'корпоратив', budget: 800000 };

test('API diagnostics stay readable in a single console argument', async () => {
  const original = console.error;
  const logs = [];
  console.error = (...args) => {
    if (String(args[0]).startsWith('[API]')) logs.push(args);
    else original(...args);
  };
  try {
    const check = async (pattern) => {
      const before = logs.length;
      await assert.rejects(getRecommendations(payload));
      assert.equal(logs.length, before + 1);
      const args = logs.at(-1);
      assert.equal(args.length, 1);
      assert.equal(typeof args[0], 'string');
      assert.match(args[0], pattern);
      assert.match(args[0], /Запрос: POST/);
      assert.notEqual(args[0], 'null');
      return args[0];
    };
    api.defaults.adapter = async config => { throw new AxiosError('Network Error', 'ERR_NETWORK', config); };
    await check(/network \| ERR_NETWORK \| HTTP нет ответа \| Network Error/);

    api.defaults.adapter = async config => { throw new AxiosError('Request failed with status code 500', 'ERR_BAD_RESPONSE', config, null, { status: 500, data: { message: 'Database unavailable' } }); };
    assert.match(await check(/http \| ERR_BAD_RESPONSE \| HTTP 500/), /Database unavailable/);

    api.defaults.adapter = async config => { throw new AxiosError('timeout of 10000ms exceeded', 'ECONNABORTED', config); };
    await check(/timeout \| ECONNABORTED/);

    api.defaults.adapter = async config => ({ status: 200, data: null, config, headers: {} });
    assert.match(await check(/invalid_response \| INVALID_API_RESPONSE \| HTTP 200/), /Ответ должен быть JSON-объектом/);

    const circular = {}; circular.self = circular;
    api.defaults.adapter = async config => { throw new AxiosError('Test circular response', 'ERR_BAD_RESPONSE', config, null, { status: 500, data: circular }); };
    assert.match(await check(/HTTP 500/), /\[Circular\]/);

    let requested = false;
    api.defaults.baseURL = 'https://railway.com/project/test/service/test';
    api.defaults.adapter = async () => { requested = true; throw new Error('Should not send'); };
    await check(/configuration \| API_URL_IS_DASHBOARD/);
    assert.equal(requested, false);

    api.defaults.baseURL = 'not-a-url';
    await check(/configuration \| INVALID_API_URL/);
    assert.equal(requested, false);

    api.defaults.baseURL = 'https://api.example.test';
    api.defaults.adapter = async config => ({ status: 200, data: { status: 'no_category_in_city', message: 'No category', recommendations: [] }, config, headers: {} });
    const before = logs.length;
    assert.equal((await getRecommendations(payload)).status, 'category_unavailable');
    assert.equal(logs.length, before);
  } finally { console.error = original; }
});
