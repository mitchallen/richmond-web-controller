/**
 * ./controllers/get=many.js
 */

"use strict";

/*jslint unparam: true*/

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
        '/:model',
        m_ssl.isSSL(prefix, methodOps),
        m_rights.isAuthorized(methodOps),
        function (req, res, next) {
            var model = req.params.model,
                emsg = "",
                obj = null,
                before = null,
                after = null,
                collection = null;
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
            function send(docs) {
                // If no change, sends 304 Not Modified (See: If-Modified-Since)
                res.status(200).json(docs);
            }
            function find(p_filter, p_fields, p_extras, p_options) {
                var filter = {},
                    fields = p_fields || '',
                    options = {};
                if (p_filter) {
                    // NOTE: where string must use double quotes or JSON.parse will throw error
                    try {
                        filter = JSON.parse(p_filter);
                    } catch (ex) {
                        emsg = "FILTER field parsing error";
                        if (log) {
                            log.error(emsg);
                            log.error(ex);
                        } else {
                            console.error(emsg);
                            console.error(ex);
                        }
                        res.status(403).json({ error: emsg });
                        return;
                    }
                }
                if (p_options) {
                     // NOTE: where string must use double quotes or JSON.parse will throw error
                    // log.info("DEBUG: OPTIONS = " + req.query.options);
                    try {
                        options = JSON.parse(p_options);
                    } catch (ex) {
                        emsg = "OPTIONS field parsing error";
                        if (log) {
                            log.error(emsg);
                            log.error(ex);
                        } else {
                            console.error(emsg);
                            console.error(ex);
                        }
                        res.status(403).json({ error: emsg });
                        return;
                    }
                }
                // MyModel.find(filter (query), fields, { sort: { ... }, skip: 10, limit: 5 }, function (err, results)
                collection.find(filter, fields, options, function (err, docs) {
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
                        res.status(404).json({ error: emsg, message: err.message });
                    } else {
                        if (after) {
                            after(
                                { req: req, res: res, docs: docs, extras: p_extras },
                                send
                            );
                        } else {
                            send(docs);
                        }
                    }
                });
            }
            if (before) {
                before(
                    { req: req },
                    find
                );
            } else {
                find(
                    req.query.filter,
                    req.query.fields,
                    null,
                    req.query.options
                );
            }
        }
    );
    return router;
};