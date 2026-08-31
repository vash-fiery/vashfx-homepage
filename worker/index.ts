export function handleRequest(request: Request) {
  const url = new URL(request.url)

  if (url.pathname.startsWith('/api/')) {
    return Response.json({
      name: 'Cloudflare',
    })
  }

  return new Response(null, { status: 404 })
}

export default {
  fetch: handleRequest,
} satisfies ExportedHandler<Env>
