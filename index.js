"use strict";

const prometheus = require('prom-client');
const onFinished = require('on-finished');

class Middleware {

  constructor(prometheus) {
    this.prometheus = prometheus;
  }

  report() {
    return function(req, res) {
      return res.contentType("text/plain")
        .send(prometheus.register.metrics());
    }
  }

  _getMetric(metricName, expected) {
    let metric;

    if (metricName instanceof expected) {
      metric = metricName;
    } else {
      metric = this.prometheus.metric(metricName);
    }

    if(!(metric instanceof expected)) {
      return false;
    }

    return metric;
  }

  heapUsage(metricNameUsed, metricNameTotal) {
    const metricUsed = this._getMetric(metricNameUsed, prometheus.Gauge)

    if(!(metricUsed instanceof prometheus.Gauge)) {
      throw new Error('heapUsage requires a Gauge metric');
    }

    const metricTotal = this._getMetric(metricNameTotal, prometheus.Gauge)

    if(!(metricTotal instanceof prometheus.Gauge)) {
      throw new Error('heapUsage requires a Gauge metric');
    }

    if (metricTotal === metricUsed) {
      throw new Error('heapUsage requires two different Gauge metrics');
    }

    return function(req, res, next) {
      const heap = process.memoryUsage();
      metricUsed.set(heap.heapUsed);
      metricTotal.set(heap.heapTotal);
      next();
    }
  }

  requestDuration(metricName) {

    const metric = this._getMetric(metricName, prometheus.Histogram)

    if(!(metric instanceof prometheus.Histogram)) {
      throw new Error('requestDuration requires a Histogram metric');
    }

    return function(req, res, next) {

      const labels = {}

      if (metric.labelNames.indexOf('http_status') !== -1) {
        labels.http_status = 0;
      }

      if (metric.labelNames.indexOf('path') !== -1) {
        labels.path = req.path;
      }

      if (metric.labelNames.indexOf('route') !== -1) {
        labels.route = null;
      }

      if (metric.labelNames.indexOf('http_method') !== -1) {
        labels.http_method = req.method;
      }

      const timeRequest = metric.startTimer(labels);

      onFinished(res, () => {
        if (labels.hasOwnProperty('http_status')) {
          labels['http_status'] = res.statusCode;
        }

        if (labels.hasOwnProperty('route')) {
          labels['route'] = req.route ? req.route.path : null;
        }

        console.log(labels)

        timeRequest();
      });

      next();
    }
  }

}

class Prometheus {

  constructor(prefix) {
    this.setPrefix(prefix);
    this.metrics = {}
    this.middlewares = new Middleware(this);
  }

  setPrefix(prefix) {
    if (!prefix || !prefix.length) return this.prefix = '';
    prefix = `${prefix.replace(/_$/,'')}_`;
    return this.prefix = prefix;
  }

  newHistogram(name, description, labels, opts) {
    return this._build(prometheus.Histogram, name, description, labels, opts);
  }

  newGauge(name, description, labels) {
    return this._build(prometheus.Gauge, name, description, labels)
  }

  metric(name) {

    const argName = this._name(name);

    if (!this._exists(name)) {
      throw new Error(`Unknown metric '${name}'`)
    }

    return this.metrics[argName];

  }

  _name(name) {
    return this.prefix + name;
  }

  _exists(name) {
    name = this._name(name);
    return !!this.metrics[name];
  }

  _build(proto, name, description, labels, opts) {

    const nameArg = this._name(name);

    if(this._exists(name)) {
      throw new Error(`Requested creation of duplicate metric '${name}'`)
    }

    const args = [null, nameArg, description, labels, opts]
    return this.metrics[nameArg] = new (Function.prototype.bind.apply(proto, args))
  }

  middleware() {
    return this.middlewares;
  }

}

module.exports = Prometheus;
