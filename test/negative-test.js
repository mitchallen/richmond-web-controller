/**
 * negative-test.js
 */

"use strict";

/*global describe, it, before, after*/

var request = require('supertest'),
    should = require('should'),
    TestConfig = require('./test-config'),
    config = new TestConfig(),
    controller = config.controller,
    getRandomInt = require('./test-lib').getRandomInt,
    service = config.service,
    port = service.port,
    prefix = service.prefix,
    dbConfig = config.mongoose,
    testHost = service.host,
    modelName = "SmokeTest",    // Will translate to lowercase
    MochaTestDoc = null;

describe('negative tests', function () {
    before(function () {
    });

    after(function () {
    });

    it( 'no controller setup options should cause listen to throw an expection', function( done ) {
        var rm = config.richmond;
            rm.logFile(config.logFolder + "negative-01-test-test.log")
            .controller(
                controller.setup()
            )
            .prefix(prefix);    // API prefix, i.e. http://localhost/v1/testdoc
        var options = {
                user: dbConfig.user,
                pass: dbConfig.pass
            };
        rm.connect(dbConfig.uri, options);
        MochaTestDoc = rm.addModel(modelName, {
            email:  { type: String, required: true },
            status: { type: String, required: true },
        });
        (function(){
            rm.listen(port);
        }).should.throw();
        rm.closeService();
        done();
    });

    it( 'empty controller setup options should cause listen to throw an expection', function( done ) {
        var rm = config.richmond;
            rm.logFile(config.logFolder + "negative-02-test.log")
            .controller(
                controller.setup({})
            )
            .prefix(prefix);    // API prefix, i.e. http://localhost/v1/testdoc
        var options = {
                user: dbConfig.user,
                pass: dbConfig.pass
            };
        rm.connect(dbConfig.uri, options);
        MochaTestDoc = rm.addModel(modelName, {
            email:  { type: String, required: true },
            status: { type: String, required: true },
        });
        (function(){
            rm.listen(port);
        }).should.throw();
        rm.closeService();
        done();
    });
    

});