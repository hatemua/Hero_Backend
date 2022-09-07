import { createServer } from 'https';
import { readFileSync } from 'fs';
import { WebSocketServer } from 'ws';

const server = createServer({

  key: readFileSync('/opt/lampp/htdocs/HeroCoin/hegemony.donftify.digital/privkey2.pem'),
cert: readFileSync('/opt/lampp/htdocs/HeroCoin/hegemony.donftify.digital/fullchain2.pem')
});
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data, { binary: isBinary });
        }
    });
  });

  ws.send('something');
});

server.listen(8081);