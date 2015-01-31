/**
 * smoke-test.js
 */

var should = require('should'),
    config = require('./test-config'),
    Controller = require('../controller'),
    ctrl = new Controller();

describe('smoke test', function () {
	before(function () {
		// ..
	});
	
	it( 'should be able to get name', function( done ) {
		should.exist( ctrl.name );
		done();
	});
	
	it( 'should be able to get version', function( done ) {
		should.exist( ctrl.version );
		done();
	});

	after(function () {
		// ...
	});
});