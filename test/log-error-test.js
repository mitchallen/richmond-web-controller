/**
 * log-error-test.js
 */

"use strict";

/*global describe, it, before, after*/

var request = require('supertest'),
    should = require('should'),
    TestConfig = require('./test-config'),
    LogError = require('../lib/log-error');

describe('log-error module', function () {
    before(function () {
    });

    after(function () {
    });

    it( 'should log to the console if no log passed to constructor', function( done ) {
        var log = new LogError();
        log.error("log-error console test");
        done();
    });

});