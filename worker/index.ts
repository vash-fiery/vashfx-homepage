const SITE_ORIGIN = 'https://www.vashfx.org'
const API_CATALOG_PATH = '/.well-known/api-catalog'
const API_CATALOG_PROFILE = 'https://www.rfc-editor.org/info/rfc9727'

type ApiDefinition = {
  anchorPath: string
  descriptionPath: string
  documentationPath: string
  statusPath: string
}

const PRIMARY_API = {
  anchorPath: '/api/',
  descriptionPath: '/openapi.json',
  documentationPath: '/api/docs',
  statusPath: '/api/health',
} as const satisfies ApiDefinition

const API_DEFINITIONS = [PRIMARY_API] as const

function absoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).href
}

const API_CATALOG = {
  linkset: API_DEFINITIONS.map((api) => ({
    anchor: absoluteUrl(api.anchorPath),
    'service-desc': [
      {
        href: absoluteUrl(api.descriptionPath),
        type: 'application/json',
      },
    ],
    'service-doc': [
      {
        href: absoluteUrl(api.documentationPath),
        type: 'text/html',
      },
    ],
    status: [
      {
        href: absoluteUrl(api.statusPath),
        type: 'application/json',
      },
    ],
  })),
}

const OPENAPI_DOCUMENT = {
  openapi: '3.1.0',
  info: {
    title: 'VASHFX API',
    version: '1.0.0',
    description: 'Public API endpoints provided by VASHFX.',
  },
  servers: [
    {
      url: SITE_ORIGIN,
    },
  ],
  paths: {
    [PRIMARY_API.anchorPath]: {
      get: {
        summary: 'Get service information',
        operationId: 'getServiceInformation',
        responses: {
          '200': {
            description: 'Service information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: {
                      type: 'string',
                      example: 'Cloudflare',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [PRIMARY_API.statusPath]: {
      get: {
        summary: 'Check API health',
        operationId: 'getApiHealth',
        responses: {
          '200': {
            description: 'The API is available',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['ok'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  externalDocs: {
    description: 'VASHFX API documentation',
    url: absoluteUrl(PRIMARY_API.documentationPath),
  },
}

const API_DOCUMENTATION = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VASHFX API documentation</title>
  </head>
  <body>
    <main>
      <h1>VASHFX API</h1>
      <p>The public API exposes service information and a health check.</p>
      <h2>Endpoints</h2>
      <ul>
        <li><code>GET /api/</code> — service information</li>
        <li><code>GET /api/health</code> — service health</li>
      </ul>
      <p><a href="/openapi.json">OpenAPI 3.1 specification</a></p>
    </main>
  </body>
</html>
`

const API_CATALOG_BODY = JSON.stringify(API_CATALOG, null, 2)
const OPENAPI_BODY = JSON.stringify(OPENAPI_DOCUMENT, null, 2)
const SERVICE_INFORMATION_BODY = JSON.stringify({ name: 'Cloudflare' })
const HEALTH_BODY = JSON.stringify({ status: 'ok' })

function contentResponse(
  request: Request,
  body: string,
  contentType: string,
  additionalHeaders?: HeadersInit,
): Response {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, {
      status: 405,
      headers: {
        Allow: 'GET, HEAD',
      },
    })
  }

  const headers = new Headers(additionalHeaders)
  headers.set('Content-Type', contentType)
  headers.set('X-Content-Type-Options', 'nosniff')

  return new Response(request.method === 'HEAD' ? null : body, { headers })
}

function apiCatalogResponse(request: Request): Response {
  const catalogUrl = absoluteUrl(API_CATALOG_PATH)

  return contentResponse(
    request,
    API_CATALOG_BODY,
    `application/linkset+json; profile="${API_CATALOG_PROFILE}"`,
    {
      Link: `<${catalogUrl}>; rel="api-catalog"; type="application/linkset+json"`,
      Vary: 'Accept',
    },
  )
}

export default {
  fetch(request) {
    const url = new URL(request.url)

    switch (url.pathname) {
      case API_CATALOG_PATH:
        return apiCatalogResponse(request)
      case PRIMARY_API.descriptionPath:
        return contentResponse(
          request,
          OPENAPI_BODY,
          'application/json; charset=UTF-8',
        )
      case PRIMARY_API.documentationPath:
        return contentResponse(
          request,
          API_DOCUMENTATION,
          'text/html; charset=UTF-8',
        )
      case PRIMARY_API.statusPath:
        return contentResponse(
          request,
          HEALTH_BODY,
          'application/json; charset=UTF-8',
        )
      case PRIMARY_API.anchorPath:
        return contentResponse(
          request,
          SERVICE_INFORMATION_BODY,
          'application/json; charset=UTF-8',
        )
      default:
        return new Response(null, { status: 404 })
    }
  },
} satisfies ExportedHandler<Env>
