# uw-lib-prometheus.js

A wrapper around [prom-client](https://github.com/siimon/prom-client).

![Build][travis-build]

## API

`Prometheus.constructor(string prefix)` if prefix provided, it will prefix ;) each metric `name`.

The `new*` methods are just decorators for prom-client metric objects and are responsible for some dupe vaidation and making sure metric objects are added into registry. 

`Prometheus.newGauge(string name, string help, string[] labels)` creates new Gauge.

`Prometheus.newHistogram(string name, string help, string[] labels, {buckets: []})` creates new Histogram.

`Prometheus.metric(string name)` returns previously created metric by name.

## Middleware

`Prometheus.metric(string name)` returns a factory for middleware handlers. Following handlers are available:

`report()` - dumps plain text metrics for Prometheus server to scrape.
`requestDuration(string|Histogram histogram)` - records request duration in seconds.
`heapUsage(string|Gauge used, string|Gauge total)` - records used and total heap in bytes.

## Examples

Quick express example is available in [examples directory](./examples).


[travis-build]: https://img.shields.io/travis/utilitywarehouse/uw-lib-prometheus.js.svg
