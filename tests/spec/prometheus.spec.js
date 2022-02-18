"use strict";

const Prometheus = require('./../../');
const httpMocks = require('node-mocks-http');

describe('Prometheus', function () {

  beforeEach(function () {
    this.sut = new Prometheus();
  });

  it('builds Counter', function () {
    const unit = this.sut.newCounter('name', 'help', ['label'])

    expect(unit).to.have.property('name', 'name');
    expect(unit).to.have.property('help', 'help');
    expect(unit.labelNames).to.eql(['label']);
  });

  it('builds Gauge', function () {
    const unit = this.sut.newGauge('name', 'help', ['label'])

    expect(unit).to.have.property('name', 'name');
    expect(unit).to.have.property('help', 'help');
    expect(unit.labelNames).to.eql(['label']);
  });

  it('builds Histogram', function () {
    const unit = this.sut.newHistogram('name', 'help', ['label'], {buckets: [1]})

    expect(unit).to.have.property('name', 'name');
    expect(unit).to.have.property('help', 'help');
    expect(unit.labelNames).to.eql(['label']);
    expect(unit.bucketValues['1']).to.eql(0);
  });

  it('can return registered metric', function () {

    this.sut.newGauge('name', 'help', ['label']);

    const unit = this.sut.metric('name');

    expect(unit).to.have.property('name', 'name');
    expect(unit).to.have.property('help', 'help');
    expect(unit.labelNames).to.eql(['label']);

  });

  it('throws when unknown metric requested', function () {
    expect(() => this.sut.metric('unknown')).to.throw();
  });

  it('fails to build dupe metric', function () {
    this.sut.newGauge('name', 'help', ['label']);

    expect(() => this.sut.newGauge('name', 'help')).to.throw();
  });

  it('builds metric with prefix', function () {

    this.sut.setPrefix('');

    expect(this.sut.newGauge('name', 'help')).to.have.property('name', 'name');

    this.sut.setPrefix('pfx_');
    expect(this.sut.newGauge('name', 'help')).to.have.property('name', 'pfx_name');

    //via constructor
    const sut = new Prometheus('pre_');
    expect(sut.newGauge('name', 'help')).to.have.property('name', 'pre_name');
  })

  it('auto suffixes prefix with underscore', function () {

    let sut = new Prometheus('pfx');

    expect(sut.prefix).to.equal('pfx_');

    sut = new Prometheus('pfx_');

    expect(sut.prefix).to.equal('pfx_');

  });

  it('does not auto suffix empty prefix with underscore', function () {

    let sut = new Prometheus('');
    expect(sut.prefix).to.equal('');

    sut = new Prometheus();
    expect(sut.prefix).to.equal('');

  });

  it('offers middleware', function () {
    const middleware = this.sut.middleware();

    expect(middleware).to.have.property('requestDuration');
    expect(middleware).to.have.property('heapUsage');
    expect(middleware).to.have.property('report');
  })

  describe('Middleware', function () {

    describe('heapUsage', function () {
      it('only accepts gauge metrics', function() {

        this.sut.newHistogram('histogram', 'help');
        this.sut.newGauge('gauge', 'help');
        this.sut.newGauge('gauge2', 'help');

        expect(()=>this.sut.middleware().heapUsage('gauge', 'histogram')).to.throw();

        expect(()=>this.sut.middleware().heapUsage('histogram', 'gauge')).to.throw();

        expect(()=>this.sut.middleware().heapUsage('gauge', 'gauge2')).to.not.throw();

      })

      it('requires two different metrics', function() {

        this.sut.newGauge('gauge1', 'help');
        this.sut.newGauge('gauge2', 'help');

        expect(()=>this.sut.middleware().heapUsage('gauge1', 'gauge1')).to.throw();

        expect(()=>this.sut.middleware().heapUsage('gauge1', 'gauge2')).to.not.throw();

      })

      describe('execution', function () {
        beforeEach(function () {
          this.sut.newGauge('gauge1', 'help');
          this.sut.newGauge('gauge2', 'help');
          this.req = httpMocks.createRequest();
          this.res = httpMocks.createResponse();
          this.middleware = this.sut.middleware();
        });

        it('calls next', function () {
          const handler = this.middleware.heapUsage('gauge1', 'gauge2');
          const spy = sinon.spy();

          handler(this.req, this.res, spy);

          expect(spy).to.have.been.called();

        })

        it('sets memory usage on gauges', function () {
          const handler = this.middleware.heapUsage('gauge1', 'gauge2');
          const spy = sinon.spy();

          handler(this.req, this.res, spy);

          expect(this.sut.metric('gauge1').get()).to.have.deep.property('values.0.value')
            .and.to.be.above(0);
          expect(this.sut.metric('gauge2').get()).to.have.deep.property('values.0.value')
            .and.to.be.above(0);

        })
      })
    })

    describe('requestDuration', function () {

      it('only accepts histogram metric', function () {

        this.sut.newGauge('gauge', 'help');

        expect(()=>this.sut.middleware().requestDuration('gauge'))
          .to.throw('requestDuration requires a Histogram metric')

      })

      it('accepts both string and object metric', function () {
        this.sut.newHistogram('histogram', 'help');

        expect(()=>this.sut.middleware().requestDuration('histogram'))
          .to.not.throw()

        expect(()=>this.sut.middleware().requestDuration(this.sut.metric('histogram')))
          .to.not.throw()
      })

      describe('execution', function () {
        beforeEach(function () {
          this.sut.newHistogram('histogram', 'help');
          this.req = httpMocks.createRequest();
          this.res = httpMocks.createResponse();
          this.middleware = this.sut.middleware();
        });

        it('calls next', function () {
          const handler = this.middleware.requestDuration('histogram');
          const spy = sinon.spy();

          handler(this.req, this.res, spy);

          expect(spy).to.have.been.called();

        })
      })
    })

  });
})
