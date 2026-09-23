import assert from 'node:assert/strict';
import { test } from 'node:test';
import { once } from 'node:events';
import { createServer, defaultDataPath } from '../server.js';
import { loadContractors } from '../recommendations.js';

const order = { city: 'Алматы', date: '2026-10-19', event_type: 'корпоратив', category: 'Ведущий', budget: 800000, duration_hours: null, language: null };
test('merged repository: dataset path, health and recommendation outcomes', async (t) => {
  const rows = loadContractors(defaultDataPath);
  assert.equal(rows.length, 66);
  const server = createServer(rows);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.deepEqual(await (await fetch(`${base}/health`)).json(), { status: 'ok', contractor_count: 66 });
  const query = async (body) => {
    const response = await fetch(`${base}/recommendations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal(response.status, 200);
    return response.json();
  };
  const matched = await query(order);
  assert.equal(matched.status, 'matched');
  assert.ok(matched.recommendations.length >= 1 && matched.recommendations.length <= 3);
  assert.deepEqual(await query(order), matched);
  for (const item of matched.recommendations) {
    const source = rows.find(row => row.id === item.id);
    assert.ok(!source.busy_dates.includes(order.date));
    assert.ok(item.price_from_kzt <= order.budget);
    assert.ok(item.explanation.length > 0);
  }
  const busy = await query({ ...order, date: '2026-10-17' });
  assert.equal(busy.status, 'no_matches');
  assert.deepEqual(busy.recommendations, []);
  const missing = await query({ ...order, category: '__integration_missing_category__' });
  assert.equal(missing.status, 'no_category_in_city');
  assert.deepEqual(missing.recommendations, []);
  assert.ok(missing.message.length > 0);
});
