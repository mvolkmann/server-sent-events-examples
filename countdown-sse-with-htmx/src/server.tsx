import {type Context, Hono} from 'hono';
import {serveStatic} from 'hono/bun';
import {streamSSE} from 'hono/streaming';

const app = new Hono();

// Serve index.html and styles.css from the public directory.
// The default port is 3000.
app.use('/*', serveStatic({root: './public'}));

let number = -1;

// This resets the number variable.
app.get('/start', (c: Context) => {
  number = Number(c.req.query('start'));
  return c.body(null);
});

app.get('/countdown', (c: Context) => {
  return streamSSE(c, async stream => {
    while (true) {
      if (number >= 0) {
        const jsx = <div>{number}</div>;
        await stream.writeSSE({
          event: 'count',
          id: String(crypto.randomUUID()),
          data: jsx.toString()
        });
        number--;
      }
      // Wait one second between each message.
      await stream.sleep(1000);
    }
  });
});

export default app;
