/**
 * test-config.js
 */

var Controller = require('../controller');
    Richmond = require('./lib/mock-richmond');

function Config() {
    this.controller = new Controller();
    this.richmond = new Richmond();
    this.logFolder = process.env.TEST_LOG_FOLDER || 'test/output/';
    this.mongoose = {
        uri:  process.env.TEST_MONGO_DB || 'mongodb://localhost/mytest',
        user: process.env.TEST_MONGO_USER || null,
        pass: process.env.TEST_MONGO_PASS || null
    };
    this.service = {
        secret: process.env.APP_SECRET || null,
        prefix: "/API",
        port: process.env.TEST_PORT || null,
        host: process.env.TEST_HOST || null,
        hostSsl:  process.env.TEST_SSL || null
    };
}

module.exports = Config;