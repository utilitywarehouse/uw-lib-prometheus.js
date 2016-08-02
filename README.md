# uw-lib-prometheus.js

A wrapper around [prom-client](https://github.com/siimon/prom-client).

## API

`Prometheus.constructor(prefix)` if prefix set, it will (^^) prefix each metric `name`.

The `new*` methods are just decorators prom-client objects and are responsible for some duplicate vaidation and making sure metric objects are added into registry. 

`Prometheus.newGauge(name, help, labels)` creates new Gauge.

`Prometheus.newHistogram(name, help, labels, {buckets: []})` creates new Histogram.

`Prometheus.metric(name)` returns previously created metric by name.

## Middleware

`Prometheus.metric(name)` returns a factory for middleware handlers. Following handlers are available:

`report()` - dumps plain text metrics for Prometheus server to scrape.
`requestDuration(histogram)` - records request duration in seconds.
`heapUsage(usedGauge, totalgauge)` - records used and total heap in bytes.

## Examples

Quick express example is available in [examples directory](./examples).

