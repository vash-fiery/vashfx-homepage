import assert from 'node:assert/strict'
import test from 'node:test'
import { handleRequest } from './index.ts'

test('returns the API name for API routes', async () => {
  for (const path of ['/api/', '/api/status?source=test']) {
    const response = await handleRequest(
      new Request(`https://www.vashfx.org${path}`),
    )

    assert.equal(response.status, 200, path)
    assert.match(response.headers.get('Content-Type') ?? '', /application\/json/)
    assert.deepEqual(await response.json(), { name: 'Cloudflare' })
  }
})

test('returns an empty 404 response outside the API namespace', async () => {
  for (const path of ['/', '/api', '/apiary']) {
    const response = await handleRequest(
      new Request(`https://www.vashfx.org${path}`),
    )

    assert.equal(response.status, 404, path)
    assert.equal(await response.text(), '')
  }
})
