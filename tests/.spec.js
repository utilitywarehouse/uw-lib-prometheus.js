process.env.NODE_ENV = 'test';

const chai = require('chai');
const dirtyChai = require('dirty-chai');
const sinon = require("sinon");
const sinonChai = require("sinon-chai");

global.expect = chai.expect;
global.sinon = sinon;

chai.use(dirtyChai);
chai.use(sinonChai);
