type ScanDepth = 'Quick' | 'Standard' | 'Deep'

type ScanRequest = {
  target: string
  depth: ScanDepth
}

const scanDepths: ScanDepth[] = ['Quick', 'Standard', 'Deep']

function isScanRequest(value: unknown): value is ScanRequest {
  if (typeof value !== 'object' || value === null) return false

  const request = value as Record<string, unknown>
  return typeof request.target === 'string'
    && request.target.trim().length > 0
    && scanDepths.includes(request.depth as ScanDepth)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/scans' && request.method === 'POST') {
      const body: unknown = await request.json().catch(() => null)
      if (!isScanRequest(body)) {
        return Response.json({ error: 'Invalid scan request' }, { status: 400 })
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
