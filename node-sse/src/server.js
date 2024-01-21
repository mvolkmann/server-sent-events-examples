import express from 'express';
import {v4 as uuidv4} from 'uuid';

const app = express();
app.use(express.static('public'));

app.get('/greet', (req, res) => {
  res.send('Hello World!');
});

app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');

  // The event name defaults to "message".
  res.write(`data: starting\n\n`); // double newline triggers sending

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

    // Use res.write instead of res.send
    // so the connection will remain open.
    // Specifying an event name and message id are optional.
    // We are overriding the default event name of "message"
    // and specifying the custom event name "count".
    // It doesn't matter what order the following calls are made,
    // but each must end in a newline and
    // the last one must have an extra newline.
    res.write('event: count\n');
    res.write(`id: ${uuidv4()}\n`);
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
