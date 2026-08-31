import { normalizeScanTarget } from './scan-target.ts'

type ScanDepth = 'Quick' | 'Standard' | 'Deep'

type ScanRequest = {
  target: string
  depth: ScanDepth
}

const scanDepths: ScanDepth[] = ['Quick', 'Standard', 'Deep']
const maximumRequestBytes = 4096
const targetError = 'Enter a full http(s) URL or a public IP address.'

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers?: HeadersInit,
) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...headers,
    },
  })
}

function isScanDepth(value: unknown): value is ScanDepth {
  return scanDepths.includes(value as ScanDepth)
}

function parseScanRequest(value: unknown): ScanRequest | Response {
  if (typeof value !== 'object' || value === null) {
    return jsonResponse({ error: targetError }, 400)
  }

  const body = value as Record<string, unknown>
  const target = normalizeScanTarget(body.target)
  if (!target) return jsonResponse({ error: targetError }, 400)
  if (!isScanDepth(body.depth)) {
    return jsonResponse({ error: 'Choose a valid scan depth.' }, 400)
  }

  return { target, depth: body.depth }
}

async function readJsonBody(request: Request) {
  const contentLength = Number(request.headers.get('Content-Length'))
  if (Number.isFinite(contentLength) && contentLength > maximumRequestBytes) {
    return jsonResponse({ error: 'The scan request is too large.' }, 413)
  }

  const contentType = request.headers.get('Content-Type')
    ?.split(';', 1)[0]
    .trim()
    .toLowerCase()
  if (contentType !== 'application/json') {
    return jsonResponse({ error: 'Send the scan request as JSON.' }, 415)
  }

  const text = await request.text()
  if (new TextEncoder().encode(text).byteLength > maximumRequestBytes) {
    return jsonResponse({ error: 'The scan request is too large.' }, 413)
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return jsonResponse({ error: 'Send a valid JSON request.' }, 400)
  }
}

export async function handleRequest(
  request: Request,
  env: Pick<Env, 'KV'>,
) {
  const url = new URL(request.url)

  if (url.pathname === '/api/scans' && request.method !== 'POST') {
    return jsonResponse(
      { error: 'Method not allowed.' },
      405,
      { Allow: 'POST' },
    )
  }

  if (url.pathname === '/api/scans') {
    const body = await readJsonBody(request)
    if (body instanceof Response) return body

    const scanRequest = parseScanRequest(body)
    if (scanRequest instanceof Response) return scanRequest

    const scan = {
      id: crypto.randomUUID(),
      ...scanRequest,
      status: 'queued',
      createdAt: new Date().toISOString(),
    }

    try {
      await env.KV.put(`scan:${scan.id}`, JSON.stringify(scan))
    } catch (error) {
      console.error('Unable to queue scan', error)
      return jsonResponse(
        { error: 'The scan service is unavailable. Please try again.' },
        503,
      )
    }

    return jsonResponse(scan, 202)
  }

  if (url.pathname.startsWith('/api/')) {
    return jsonResponse({ error: 'Not found.' }, 404)
  }

  return new Response(null, { status: 404 })
}

export default {
  fetch: handleRequest,
} satisfies ExportedHandler<Env>
