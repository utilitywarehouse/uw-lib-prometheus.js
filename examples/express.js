const express = require('express');
const app = express();

const prometheus = new (require('./../index'))('example');
const middleware = prometheus.middleware();

prometheus.newHistogram(
  'http_request_seconds',
  'Request duration',
  ['http_status', 'path'],
  {buckets: [0.001, 0.1, 0.3, 0.5, 0.8, 1, 3, 5, 10]}
);

prometheus.newGauge('heap_used', 'Bytes of used heap');
prometheus.newGauge('heap_total', 'Bytes of total heap');

app.use(middleware.requestDuration('http_request_seconds'));

app.get('/metrics', middleware.heapUsage('heap_used', 'heap_total'), middleware.report());

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
