import { env } from "cloudflare:workers";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return Response.json({
        name: "Cloudflare",
      });
    }
    return env.ASSETS.fetch(request);
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);
    switch (request.method) {
      case "PUT":
        await env.BUCKET.put(key, request.body);
        return new Response(`Put ${key} successfully!`);
      default:
        return new Response(`${request.method} is not allowed.`, {
          status: 405,
          headers: {
            Allow: "PUT",
          },
        });
    }
  },
} satisfies ExportedHandler<Env>;