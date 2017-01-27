/**
 * rights-module-test.js
 */

"use strict";

/*global describe, it, before, after*/

var request = require('supertest'),
    should = require('should'),
    TestConfig = require('./test-config'),
    rights = require('../lib/rights');

describe('rights module', function () {
    before(function () {
    });

    after(function () {
    });

    it( '.secret should succeed', function( done ) {
        rights.secret("fubar");
        done();
    });

    it( '.validateRole with no argument should return null', function( done ) {
        var result = rights.validateRole();
        should.not.exist(result);
        done();
    });

    it( '.validateRole with invalid role should return null', function( done ) {
        var result = rights.validateRole("fubar");
        should.not.exist(result);
        done();
    });

    it( '.validateRole with white space in role should return null', function( done ) {
        var result = rights.validateRole("fu bar");
        should.not.exist(result);
        done();
    });

    it( '.validateRole with "admin" role should return role', function( done ) {
        var role = "admin";
        var result = rights.validateRole( role );
        should.exist(result);
        result.should.eql(role);
        done();
    });

    it( '.validateRole with "user" role should return role', function( done ) {
        var role = "user";
        var result = rights.validateRole( role );
        should.exist(result);
        result.should.eql(role);
        done();
    });

    it( '.validateRole with "public" role should return role', function( done ) {
        var role = "user";
        var result = rights.validateRole( role );
        should.exist(result);
        result.should.eql(role);
        done();
    });

    it( '.validateRole with all caps role should return role', function( done ) {
        var role = "ADMIN";
        var result = rights.validateRole( role );
        should.exist(result);
        result.should.eql(role.toLowerCase());
        done();
    });

    it( '.validateRole with mixed case role should return role', function( done ) {
        var role = "Admin";
        var result = rights.validateRole( role );
        should.exist(result);
        result.should.eql(role.toLowerCase());
        done();
    });

    it( '.isAuthorized with no argument should return function', function( done ) {
        var f = rights.isAuthorized();
        f.should.be.type('function');
        done();
    });

    it( '.isAuthorized child function with no arguments should return throw exception', function( done ) {
        var fChild = rights.isAuthorized();
        (function(){
            fChild();
        }).should.throw();
        done();
    });


    it( '.isAuthorized child function with no req should return next result', function( done ) {
        var fChild = rights.isAuthorized();
        function xNext(arg) {
            return arg;
        }
        var result = fChild( null, null, xNext );
        should.exist(result);
        result.should.eql({ 
            status: 500, 
            message: 'INTERNAL ERROR (isAuthorized): req not defined.', 
            type: 'internal' });
        done();
    });

    it( '.isAuthorized child function with invalid rights should return 403', function( done ) {
        var fChild = rights.isAuthorized();
        function xNext(arg) {
            return arg;
        }

        var req = {
            params: {
                model: "foo"
            },
            token: "123"
        }

        var result = fChild( req, null, xNext );
        should.exist(result);
        result.status.should.eql(403);
        result.type.should.eql('authorization');
        done();
    });

    it( '.isAuthorized child function with public rights and null next should throw an exception', function( done ) {
        (function(){
            var modelName = "foo";
            var authorization = [{ model: modelName, rights: "PUBLIC" }];
            var fChild = rights.isAuthorized( authorization );
            var req = {
                params: {
                    model: modelName
                },
                token: "123"
            }
            fChild( req, null, null );
        }).should.throw();
        done();
    });


});