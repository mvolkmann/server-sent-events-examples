import {type Context, Hono} from 'hono';
import {serveStatic} from 'hono/bun';
import {streamSSE} from 'hono/streaming';

const app = new Hono();

// Serve index.html and styles.css from the public directory.
// The default port is 3000.
app.use('/*', serveStatic({root: './public'}));

app.get('/countdown', (c: Context) => {
  const start = c.req.query('start');

  return streamSSE(c, async stream => {
    let number = Number(start);

    // Verify that query parameter could be converted to a number.
    if (isNaN(number)) {
      await stream.writeSSE({
        event: 'error',
        data: 'start query parameter must be a number'
      });
      return;
    }

    while (number >= 0) {
      await stream.writeSSE({
        event: 'count',
        data: String(number) // must be a string
      });
      await Bun.sleep(1000); // wait one second between each message
      number--;
    }
  });
});

export default app;
