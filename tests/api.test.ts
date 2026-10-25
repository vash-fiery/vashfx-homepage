import assert from 'node:assert/strict'
import test, { type TestContext } from 'node:test'
import { fetchApiName } from '../src/api.ts'

type FetchInput = Parameters<typeof fetch>[0]
type FetchOptions = Parameters<typeof fetch>[1]

test('loads a string name from the same-origin API', async (t) => {
  t.mock.method(globalThis, 'fetch', async (input: FetchInput) => {
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

function mockTimeout(t: TestContext) {
  const controller = new AbortController()
  t.mock.method(AbortSignal, 'timeout', (milliseconds: number) => {
    assert.equal(milliseconds, 10_000)
    return controller.signal
  })
  return controller
}

test('times out when the API never sends response headers', async (t) => {
  const controller = mockTimeout(t)
  t.mock.method(globalThis, 'fetch', (_input: FetchInput, options?: FetchOptions) => {
    assert.ok(options?.signal, 'the request must have a timeout signal')
    const signal = options.signal
    return new Promise<Response>((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true })
    })
  })

  const pending = fetchApiName()
  controller.abort(new DOMException('API request timed out', 'TimeoutError'))

  await assert.rejects(pending, { name: 'TimeoutError' })
})

test('times out when the API response body stalls', async (t) => {
  const controller = mockTimeout(t)
  t.mock.method(globalThis, 'fetch', async (_input: FetchInput, options?: FetchOptions) => {
    assert.ok(options?.signal, 'body reads must share the request timeout')
    const signal = options.signal
    return new Response(new ReadableStream({
      start(stream) {
        signal.addEventListener('abort', () => stream.error(signal.reason), { once: true })
      },
    }))
  })

  const pending = fetchApiName()
  await Promise.resolve()
  controller.abort(new DOMException('API request timed out', 'TimeoutError'))

  await assert.rejects(pending, { name: 'TimeoutError' })
})
