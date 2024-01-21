import { Context, Hono } from "hono";
import { serveStatic } from "hono/bun";
import { streamSSE } from "hono/streaming";

const app = new Hono();
app.use("/*", serveStatic({ root: "./public" }));

app.get("/greet", (c: Context) => {
  return c.text("Hello Bun!");
});

app.get("/sse", (c: Context) => {
  // const res = streamSSE(c, async (stream) => {
  return streamSSE(c, async (stream) => {
    let count = 0;
    while (count < 10) {
      count++;

      await stream.writeSSE({
        // TODO: Why does the next line trigger an error?
        // event: "count", // optional
        id: String(crypto.randomUUID()), // optional
        data: String(count), // TODO: Is this required to be a string?
      });
    }
  });

  // console.log("server.ts sse: res =", res);

  // This is invoked when the client calls close on the EventSource.
  //res.socket.on("close", () => {
  c.req.raw.signal.addEventListener("abort", () => {
    console.log("got abort event");
    //res.end();
  });

  // return res;
});

export default app;
