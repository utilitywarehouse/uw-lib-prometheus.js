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

`requestDuration(string|Histogram histogram)` - records request duration in seconds, will try and assign labels based on what the histogram has defined, recognised labels are
  - `http_status` - captures status on the response object
  - `http_method` - captures request method (POST, GET etc.)
  - `path`		- captures request path, note that for parametrised routes it will capture actual parameters (eg. `/user/123123`)
  - `route`		- captures route regex, this is useful for parametrised routes (eg. `/user/:id`)

`heapUsage(string|Gauge used, string|Gauge total)` - records used and total heap in bytes.

[travis-build-badge]: https://img.shields.io/travis/utilitywarehouse/uw-lib-prometheus.js.svg?style=flat-square
[travis-build-url]: https://travis-ci.org/utilitywarehouse/uw-lib-prometheus.js

## NPM

Lib is published on NPM under the `utilitywarehosue` namespace. It is public.

```yarn add @utilitywarehouse/uw-lib-prometheus.js```
