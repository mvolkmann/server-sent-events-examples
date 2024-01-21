import { Context, Hono } from "hono";
import { serveStatic } from "hono/bun";
import { streamSSE } from "hono/streaming";

const app = new Hono();
app.use("/*", serveStatic({ root: "./public" }));

app.get("/greet", (c: Context) => {
  return c.text("Hello Bun!");
});

app.get("/sse", (c: Context) => {
  return streamSSE(c, async (stream) => {
    // This should be invoked when the client calls close on the EventSource,
    // but it is not!
    // TODO: See https://github.com/honojs/hono/issues/1770.
    c.req.raw.signal.addEventListener("abort", () => {
      console.log("got abort event");
      // TODO: How can the connection be closed?
    });

    await stream.writeSSE({ data: "starting" });

    let count = 0;
    while (count < 10) {
      count++;

      await stream.writeSSE({
        event: "count",
        id: String(crypto.randomUUID()),
        data: String(count), // TODO: Is this required to be a string?
      });
    }
  });
});

export default app;
