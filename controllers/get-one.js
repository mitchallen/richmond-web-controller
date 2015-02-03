/**
 * ./controllers/get=one.js
 */

"use strict";

/*jslint unparam: true, nomen: true*/

var m_ssl = require('../lib/ssl'),
    m_rights = require('../lib/rights'),
    u = require("underscore");

module.exports = function (parentInfo, mOps) {
    var info = parentInfo || {},
        parent = info.parent || {},
        log = parent.log,
        router = info.router,
        prefix = info.prefix,
        methodOps = mOps || {};
    router.get(
        '/:model/:id',
        m_ssl.isSSL(prefix, methodOps),
        m_rights.isAuthorized(methodOps),
        function (req, res, next) {
            var model = req.params.model,
                emsg = "",
                obj,
                before = null,
                after = null,
                collection = null;
            function send(doc) {
                // If no change, sends 304 Not Modified (See: If-Modified-Since)
                res.status(200).json(doc);
            }
            collection = req.collection; // Set by router.param('model', ...);
            if (!collection) {
                // Should never get here if router.params did job right
                emsg = "INTERNAL ERROR: router.param let null model collection through.";
                if (log) {
                    log.error(emsg);
                } else {
                    console.error(emsg);
                }
                res.status(500).json({ error: emsg });
                return;
            }
            obj = u.find(
                methodOps,
                function (obj) { return obj.model.toLowerCase() === model.toLowerCase(); }
            );
            before = obj.before;
            after  = obj.after;
            function find(p_fields, p_extras) {
                var fields = p_fields || '';
                collection.findOne({ _id : req.params.id }, fields, function (err, doc) {
                    if (err) {
                        emsg = "Model find error '" + model + "' not found. [2]";
                        if (log) {
                            log.error(emsg);
                            log.error(err);
                        } else {
                            console.error(emsg);
                            console.error(err);
                        }
                        // return next(err);
                        return res.status(404).json({ error: emsg, message: err.message });
                    }
                    if (after) {
                        after(
                            { req: req, res: res, doc: doc, extras: p_extras },
                            send
                        );
                    } else {
                        send(doc);
                    }
                });
            }
            if (before) {
                before(
                    { req: req },
                    find
                );
            } else {
                find(req.query.fields, null);
            }
        }
    );
    return router;
};