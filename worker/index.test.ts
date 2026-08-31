import assert from 'node:assert/strict'
import test from 'node:test'
import { handleRequest } from './index.ts'

type StoredValue = {
  key: string
  value: string
}

function createEnvironment(options?: { failWrites?: boolean }) {
  const storedValues: StoredValue[] = []
  const KV = {
    async put(key: string, value: string) {
      if (options?.failWrites) throw new Error('KV unavailable')
      storedValues.push({ key, value })
    },
  } as unknown as KVNamespace

  return {
    env: { KV } as Pick<Env, 'KV'>,
    storedValues,
  }
}

function scanRequest(body: unknown, headers?: HeadersInit) {
  return new Request('https://www.vashfx.org/api/scans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

test('queues a valid public URL', async () => {
  const { env, storedValues } = createEnvironment()
  const response = await handleRequest(
    scanRequest({
      target: 'https://www.example.com/path#section',
      depth: 'Standard',
    }),
    env,
  )
  const body = await response.json() as Record<string, unknown>

  assert.equal(response.status, 202)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.equal(body.target, 'https://www.example.com/path')
  assert.equal(body.depth, 'Standard')
  assert.equal(body.status, 'queued')
  assert.equal(storedValues.length, 1)
  assert.match(storedValues[0].key, /^scan:[\da-f-]+$/)
  assert.deepEqual(JSON.parse(storedValues[0].value), body)
})

test('accepts public IPv4 and IPv6 targets', async () => {
  for (const target of ['8.8.8.8', '2606:4700:4700::1111']) {
    const { env } = createEnvironment()
    const response = await handleRequest(
      scanRequest({ target, depth: 'Quick' }),
      env,
    )

    assert.equal(response.status, 202, target)
  }
})

test('rejects malformed, private, and reserved targets', async () => {
  const invalidTargets = [
    'not-a-host',
    '01.2.3.4',
    'ftp://example.com',
    'https://user:secret@example.com',
    'http://127.0.0.1',
    'http://10.0.0.1',
    'http://169.254.169.254',
    'http://192.0.2.1',
    'http://[::1]',
    'http://[2001:db8::1]',
    'https://service.local',
  ]

  for (const target of invalidTargets) {
    const { env, storedValues } = createEnvironment()
    const response = await handleRequest(
      scanRequest({ target, depth: 'Deep' }),
      env,
    )

    assert.equal(response.status, 400, target)
    assert.equal(storedValues.length, 0, target)
  }
})

test('rejects invalid request metadata and methods', async () => {
  const { env } = createEnvironment()

  const invalidDepth = await handleRequest(
    scanRequest({ target: 'https://example.com', depth: 'Extreme' }),
    env,
  )
  assert.equal(invalidDepth.status, 400)

  const invalidJson = await handleRequest(scanRequest('{'), env)
  assert.equal(invalidJson.status, 400)

  const invalidContentType = await handleRequest(
    scanRequest('{}', { 'Content-Type': 'text/plain' }),
    env,
  )
  assert.equal(invalidContentType.status, 415)

  const oversizedRequest = await handleRequest(
    scanRequest({ padding: 'x'.repeat(5000) }),
    env,
  )
  assert.equal(oversizedRequest.status, 413)

  const getResponse = await handleRequest(
    new Request('https://www.vashfx.org/api/scans'),
    env,
  )
  assert.equal(getResponse.status, 405)
  assert.equal(getResponse.headers.get('Allow'), 'POST')
})

test('returns a safe error when storage is unavailable', async () => {
  const { env } = createEnvironment({ failWrites: true })
  const originalError = console.error
  console.error = () => undefined

  try {
    const response = await handleRequest(
      scanRequest({ target: 'https://example.com', depth: 'Standard' }),
      env,
    )
    const body = await response.json() as Record<string, unknown>

    assert.equal(response.status, 503)
    assert.equal(
      body.error,
      'The scan service is unavailable. Please try again.',
    )
  } finally {
    console.error = originalError
  }
})

test('returns JSON 404 responses for unknown API routes', async () => {
  const { env } = createEnvironment()
  const response = await handleRequest(
    new Request('https://www.vashfx.org/api/unknown'),
    env,
  )

  assert.equal(response.status, 404)
  assert.match(response.headers.get('Content-Type') ?? '', /application\/json/)
})
