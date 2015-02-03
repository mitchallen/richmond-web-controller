/**
 * mock-richmond.js
 */
 
var bodyParser = require('body-parser'),
    multer = require('multer');

function MockRichmond() {
    this.ctrl = null;
    this.m_prefix = "";
    this.m_secret = 'secret';
    this.app = require('express')();
    this.mongoose = require('mongoose');
    this.Schema = this.mongoose.Schema;
    this.ObjectId = this.Schema.ObjectId;
    this.router = require('express').Router();
    this.server = null;
    this.m_conn = null;
    this.m_model = require('./model');
 }

module.exports = MockRichmond; // For export

MockRichmond.prototype.controller = function (mod) {
    this.ctrl = mod;
    return this;
};

MockRichmond.prototype.connection = function () {
    return this.m_conn;
};

MockRichmond.prototype.secret = function (s) {
    this.m_secret = s;
    return this;
};

MockRichmond.prototype.prefix = function (s) {
    if (s === undefined) {
        return this.m_prefix;  // GET
    }
    if (!s) {    // SET
        throw new Error("ERROR: prefix can't be null.");
    } else if (!s.match(/^\//)) {
        throw new Error("ERROR: prefix must begin with a slash");
    } else if (s.match(/\/$/)) {
        throw new Error("ERROR: prefix must not end with a slash");
    } else if (s.match(/\s+/)) {
        throw new Error("ERROR: prefix must not contain whitepace");
    } else {
        this.m_prefix = s.toLowerCase();
    }
};

MockRichmond.prototype.closeConnection = function () {
    if (this.m_conn) {
        this.mongoose.disconnect();
        this.m_conn = null;
    }
};

MockRichmond.prototype.connect = function (uri, options) {
    var eMsg = "",
        cb = null;
    this.closeConnection();
    if (!uri) {
        throw new Error("connection string (uri) not defined.");
    }
    cb = function (err) {
        if (err) {
            throw err;
        }
    };
    if (!options.user) {
        this.m_conn = this.mongoose.createConnection(uri, cb);
    } else {
        if (!options.pass) {
            throw new Error( "database password not defined." );
        }
        this.m_conn = this.mongoose.createConnection(uri, options, cb);
    }
    return this;
};

MockRichmond.prototype.model = function (name) {
    return this.m_model.model(name.toLowerCase());
};

MockRichmond.prototype.normalizeModelName = function (name) {
    return this.m_model.normalizeModelName(name);
};

MockRichmond.prototype.addModel = function (modelName, model) {
    if (!this.m_conn) {
        throw new Error("Must connect to database first.");
    }
    return this.m_model.addModel(
        modelName,
        model,
        this.m_conn
    );
};

MockRichmond.prototype.listen = function (port) {
    this.app.use(bodyParser.json()); // for parsing application/json
    this.app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    this.app.use(multer()); // for parsing multipart/form-data
    this.app.use(require('./token')(this.m_secret, this.log));
    this.router.stack = [];
    if (this.ctrl) {
        this.ctrl
            .parent(this)
            .router(this.router)
            .prefix(this.prefix())
            .install(this.app);
    }
    // ERROR handler - put last.
    /*jslint unparam: true*/
    this.app.use(function (err, req, res, next) {
        var errObject = {
            message: err.message,
            error: err
        };
        console.error("ERROR HANDLER: " + JSON.stringify(errObject));
        try {
            res.status(err.status || 500);
            res.send(errObject);
        } catch (ex) {
            console.error("### DEBUG - resend error");
        }
        return; // Stop propagation
    });
    /*jslint unparam: false*/
    // console.log("Listening on port:", port);
    this.server = this.app.listen(port);
    return this;
};

MockRichmond.prototype.closeService = function () {
    this.close();
    if (this.ctrl) {
        this.ctrl.clear();
        this.ctrl = null;
    }
    this.ctrl = null;
    if (this.server) {
        this.server.close();
        this.server = null;
    }
    return this;
};

MockRichmond.prototype.close = function () {
    this.closeConnection();
};
