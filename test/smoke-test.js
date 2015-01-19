/**
 * smoke-test.js
 */

var should = require('should'),
    config = require('./test-config'),
    micro = require('../rwc');

describe('smoke test', function () {
	before(function () {
		// ..
	});
	
	it( 'should be able to get name', function( done ) {
		// console.log( "Name:",micro.name );
		should.exist( micro.name );
		done();
	});
	
	it( 'should be able to get version', function( done ) {
		// console.log( "Version:",micro.version );
		should.exist( micro.version );
		done();
	});

	after(function () {
		// ...
	});
});