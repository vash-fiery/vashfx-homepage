export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);
    
    if (url.pathname.startsWith("/api/")) {
      return new Response.json({
        name: "Cloudflare",
      });
    };
  
    switch (request.method) {
      case "PUT": {
        await env.BUCKET.put(key, request.body, {
          onlyIf: request.headers,
          httpMetadata: request.headers,
        });
        return new Response(`Put ${key} successfully!`);
      }
      case "GET": {
        const object = await env.BUCKET.get(key, {
          onlyIf: request.headers,
          range: request.headers,
        });

        if (object === null) {
          return new Response("Object Not Found", { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);

        // When no body is present, preconditions have failed
        return new Response("body" in object ? object.body : undefined, {
          status: "body" in object ? 200 : 412,
          headers,
        });
      }
      case "DELETE": {
        await env.BUCKET.delete(key);
        return new Response("Deleted!");
      }
      default:
        return new Response("Method Not Allowed", {
          status: 405,
          headers: {
            Allow: "PUT, GET, DELETE",
          },
        });
    }
    return new Response(null, { status: 404 });
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;