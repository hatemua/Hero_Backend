import { createServer } from 'https';
import { readFileSync } from 'fs';
import { WebSocketServer } from 'ws';

const server = createServer({

  key: fs.readFileSync('/opt/lampp/htdocs/HeroCoin/hegemony.donftify.digital/privkey2.pem'),
cert: fs.readFileSync('/opt/lampp/htdocs/HeroCoin/hegemony.donftify.digital/fullchain2.pem')
});
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});

server.listen(8081);