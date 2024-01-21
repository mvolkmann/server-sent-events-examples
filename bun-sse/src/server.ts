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
    let count = 0;
    while (count < 10) {
      count++;

      await stream.writeSSE({
        id: String(crypto.randomUUID()), // optional
        event: "count", // optional
        data: String(count), // TODO: Is this required to be a string?
      });
    }
  });

  /*
  // This is invoked when the client calls close on the EventSource.
  // TODO: FIX THIS!  Do you need to capture the streamSSE return value?
  const { res } = c;
  res.socket.on("close", () => {
    console.log("server.js: got close event");
    res.end();
  });
  */
});

export default app;
