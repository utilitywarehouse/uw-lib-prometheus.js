# uw-lib-prometheus.js

A wrapper around [prom-client](https://github.com/siimon/prom-client).

[![Build][travis-build-badge]][travis-build-url]

## Install

    npm install --save uw-lib-prometheus.js

## Use

    const prometheus = require('uw-lib-prometheus.js')();
    
    prometheus.newGauge('name', 'help').set(10);
    
Quick express example is available in [examples directory](./examples).

## API

`Prometheus.constructor(string prefix)` if prefix provided, it will prefix ;) each metric `name`.

The `new*` methods are just decorators for prom-client metric objects and are responsible for some dupe vaidation and making sure metric objects are added into registry. 

`Prometheus.newGauge(string name, string help, string[] labels)` creates new Gauge.

`Prometheus.newHistogram(string name, string help, string[] labels, {buckets: []})` creates new Histogram.

`Prometheus.metric(string name)` returns previously created metric by name.

## Middleware

`Prometheus.middleware()` returns a factory for middleware handlers. Following handlers are available:

`report()` - dumps plain text metrics for Prometheus server to scrape.
`requestDuration(string|Histogram histogram)` - records request duration in seconds.
`heapUsage(string|Gauge used, string|Gauge total)` - records used and total heap in bytes.

`requestDuration` will try and assign labels for path and http_status as long as you configured those labels when vreating histogram.

[travis-build-badge]: https://img.shields.io/travis/utilitywarehouse/uw-lib-prometheus.js.svg?style=flat-square
[travis-build-url]: https://travis-ci.org/utilitywarehouse/uw-lib-prometheus.js
