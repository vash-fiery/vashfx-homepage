type ScanDepth = 'Quick' | 'Standard' | 'Deep'

type ScanRequest = {
  target: string
  depth: ScanDepth
}

const maximumTargetLength = 2048
const scanDepths: ScanDepth[] = ['Quick', 'Standard', 'Deep']

function isScanRequest(value: unknown): value is ScanRequest {
  if (typeof value !== 'object' || value === null) return false

  const request = value as Record<string, unknown>
  return typeof request.target === 'string'
    && request.target.trim().length > 0
    && request.target.trim().length <= maximumTargetLength
    && scanDepths.includes(request.depth as ScanDepth)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/scans' && request.method !== 'POST') {
      return Response.json(
        { error: 'Method not allowed' },
        { status: 405, headers: { Allow: 'POST' } },
      )
    }

    if (url.pathname === '/api/scans') {
      const body: unknown = await request.json().catch(() => null)
      if (!isScanRequest(body)) {
        return Response.json(
          { error: 'Enter a valid target and scan depth.' },
          { status: 400 },
        )
      }

      const scan = {
        id: crypto.randomUUID(),
        target: body.target.trim(),
        depth: body.depth,
        status: 'queued',
        createdAt: new Date().toISOString(),
      }
      await env.KV.put(`scan:${scan.id}`, JSON.stringify(scan))

      return Response.json(scan, { status: 202 })
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    return new Response(null, { status: 404 })
  },
} satisfies ExportedHandler<Env>
