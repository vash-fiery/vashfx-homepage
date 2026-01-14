import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.get("/api/random", (c) => c.json({ number: Math.random() }));

app.get("/api/time", (c) => c.json({ time: new Date().toLocaleTimeString }));

export default app;
