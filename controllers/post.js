/**
 * ./controllers/post.js 
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
        methodOps  = mOps || {};
    router.post(
        '/:model',
        m_ssl.isSSL(prefix, methodOps),
        m_rights.isAuthorized(methodOps),
        function (req, res, next) {
            var model = req.params.model,
                emsg = "",
                ex = null,
                obj = null,
                before = null,
                after = null,
                Collection = req.collection;// Set by router.param('model', ...);
            if (!Collection) {
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
            function sendDocument(doc) {
                res
                    .location("/" + model + "/" + doc._id)
                    .status(201)    // Created
                    .json(doc);
            }
            function saveDocument(body, _extras) {
                var record = new Collection(body);
                if (!record) {
                    emsg = "ERROR: Creating new " + model;
                    if (log) {
                        log.error(emsg);
                    } else {
                        console.error(emsg);
                    }
                    res.status(403).json({ error: emsg });
                    return;
                }
                record.save(function (err, doc) {
                    if (err) {
                        emsg = "ERROR: Can't create new '" + model + "'";
                        // Typical - doesn't pass validation, etc.
                        ex = { error: emsg, message: err.message };
                        if (log) {
                            log.error(emsg);
                            log.error(ex);
                        } else {
                            console.error(emsg);
                            console.error(ex);
                        }
                        res.status(403).json(ex);
                        return;
                    }
                    if (after) {
                        after(
                            {
                                req: req,
                                res: res,
                                result: doc,
                                extras: _extras
                            },
                            sendDocument
                        );
                    } else {
                        sendDocument(doc);
                    }
                });
            }
            if (before) {
                before(
                    { req: req },
                    saveDocument
                );
            } else {
                saveDocument(req.body, null);
            }
        }
    );
    return router;
};
