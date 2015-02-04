/**
 * ssl.js
 */

"use strict";

var lib = {},
    u = require("underscore");

module.exports = lib;

lib.isSSL = function (prefix, options) {
    return function (req, res, next) {
        var model = null,
            sslStatus = null,
            emsg = "",
            obj = null;
        if (!req) {
            emsg = "INTERNAL ERROR (isSSL): req not defined.";
            return next({ status: 500, message: emsg, type: 'internal'});
        }
        model = req.params.model;
        obj = u.find(
            options,
            function (obj) { return obj.model.toLowerCase() === model.toLowerCase(); }
        );
        if (obj) {
            sslStatus = obj.ssl;
        }
        if (sslStatus) {
            if (req.connection.encrypted || (req.headers['x-forwarded-proto'] === "https")) {
                next();
                return;
            }
            if (sslStatus === 302) {
                return res.redirect("https://" + req.headers.host + prefix + req.url);
            }
            if (sslStatus === 404) {
                // Instead of redirecting, return not found
                return res.sendStatus(404);
            }
            emsg = "INTERNAL ERROR: Only 302 or 404 allowed for sslStatus.";
            return next({ status: 500, message: emsg, type: 'internal'});
        }
        next();
    };
};