import {type Context, Hono} from 'hono';
import {serveStatic} from 'hono/bun';
import {streamSSE} from 'hono/streaming';

const app = new Hono();

// Serve index.html and styles.css from the public directory.
// The default port is 3000.
app.use('/*', serveStatic({root: './public'}));

let number = 5;

app.post('/start', async (c: Context) => {
  // number = Number(c.req.query('start'));
  const formData = await c.req.formData();
  number = Number(formData.get('start'));
  console.log('server.ts /start: number =', number);
  return c.body(null);
});

app.get('/countdown', (c: Context) => {
  return streamSSE(c, async stream => {
    while (true) {
      if (number >= 0) {
        await stream.writeSSE({
          event: 'count',
          id: String(crypto.randomUUID()),
          data: String(number) // must be a string
        });
        number--;
      }
      await stream.sleep(1000); // wait one second between each message
    }
  });
});

export default app;
