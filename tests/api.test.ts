import assert from 'node:assert/strict'
import test from 'node:test'
import { setImmediate } from 'node:timers/promises'
import { fetchApiName } from '../src/api.ts'

test('loads a string name from the same-origin API', async (t) => {
  t.mock.method(globalThis, 'fetch', async (input: Parameters<typeof fetch>[0]) => {
    assert.equal(input, '/api/')
    return Response.json({ name: 'Cloudflare' })
  })

  assert.equal(await fetchApiName(), 'Cloudflare')
})

test('rejects unsuccessful HTTP responses', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 503 }))

  await assert.rejects(fetchApiName(), /API request failed: 503/)
})

test('rejects network failures', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('Network unavailable')
  })

  await assert.rejects(fetchApiName(), /Network unavailable/)
})

test('rejects malformed JSON', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('not JSON'))

  await assert.rejects(fetchApiName(), SyntaxError)
})

test('rejects JSON without a string name', async (t) => {
  let payload: unknown
  t.mock.method(globalThis, 'fetch', async () => Response.json(payload))

  for (payload of [null, {}, [], { name: 42 }, { name: false }, { name: null }]) {
    await assert.rejects(fetchApiName(), /Invalid API response/)
  }
})

for (const stalledStage of ['headers', 'body'] as const) {
  test(`times out after 10 seconds when response ${stalledStage} stall`, async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] })
    t.mock.method(globalThis, 'fetch', (
      _input: Parameters<typeof fetch>[0], options?: Parameters<typeof fetch>[1],
    ) => {
      const signal = options?.signal
      if (stalledStage === 'headers') {
        return new Promise<Response>((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(signal.reason), { once: true })
        })
      }
      return Promise.resolve(new Response(new ReadableStream({
        start(stream) {
          signal?.addEventListener('abort', () => stream.error(signal.reason), { once: true })
        },
      })))
    })

    let settled = false
    const pending = fetchApiName()
    pending.then(() => { settled = true }, () => { settled = true })
    t.mock.timers.tick(9_999)
    await Promise.resolve()
    assert.equal(settled, false, 'the request should still be pending before its deadline')

    t.mock.timers.tick(1)
    await setImmediate()
    assert.equal(settled, true, 'the stalled request must settle at its deadline')
    await assert.rejects(pending, { name: 'TimeoutError' })
  })
}
