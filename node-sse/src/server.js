import express from 'express';
import {v4 as uuidv4} from 'uuid';

const app = express();
app.use(express.static('public'));

app.get('/greet', (req, res) => {
  res.send('Hello World!');
});

app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  let count = 0;
  while (count < 10) {
    count++;

    /*
    if (count === 3) {
      // Both of these options seem bad.
      // throw new Error('stopping early');
      // res.status(500).send('stopping early');
      break;
    }
    */

    // Must use res.write instead of res.send
    // so the connection will remain open.
    res.write(`event: count\n`); // optional
    res.write(`id: ${uuidv4()}\n`); // optional
    res.write(`data: ${count}\n\n`);
  }

  // This is invoked when the client calls close on the EventSource.
  res.socket.on('close', () => {
    console.log('server.js: got close event');
    res.end();
  });
});

app.listen(3000, function () {
  console.log('listening on port', this.address().port);
});
