/**
 * ssl-module-test.js
 */

"use strict";

/*global describe, it, before, after*/

var request = require('supertest'),
    should = require('should'),
    TestConfig = require('./test-config'),
    ssl = require('../lib/ssl');

describe('ssl module', function () {
    before(function () {
    });

    after(function () {
    });

    it( '.isSSL with no arguments should return function', function( done ) {
        var f = ssl.isSSL();
        f.should.be.type('function');
        done();
    });

    it( '.isSSL child function called with no arguments should throw an exception', function( done ) {
        var fChild = ssl.isSSL();
        (function(){
            fChild( null, null, null );
        }).should.throw();
        done();
    });

    it( '.isSSL child function called with invalid ssl value should return error object', function( done ) {
        var modelName = "foo";
        var options = [{ model: modelName, rights: "ADMIN", ssl: 200 }]
        var fChild = ssl.isSSL('/api', options );
        function xNext(arg) {
            return arg;
        }
        var req = {
            headers: {
                ['x-forwarded-proto']: 'http'
            },
            connection: {
                encrypted: false,
            },
            params: {
                model: modelName
            },
            token: "123"
        }
        var result = fChild( req, null, xNext );
        should.exist(result);
        result.should.eql({ 
            status: 500, 
            message: 'INTERNAL ERROR: Only 302 or 404 allowed for sslStatus.', 
            type: 'internal' });
        done();
    });

});