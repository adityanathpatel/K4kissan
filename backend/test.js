const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('hello');
});

server.listen(5001, () => {
  console.log('HTTP server listening on 5001');
});
