/**
 * ./controllers/del.js 
 */

"use strict";

/*jslint unparam: true*/

var m_ssl = require('../lib/ssl'),
    m_rights = require('../lib/rights'),
    LogError = require('../lib/log-error'),
    u = require("underscore");

module.exports = function (parentInfo, mOps) {
    var info = parentInfo || {},
        parent = info.parent || {},
        log = new LogError(parent.log),
        router = info.router,
        prefix = info.prefix,
        methodOps = mOps || {};
    router.delete(
        '/:model/:id',
        m_ssl.isSSL(prefix, methodOps),
        m_rights.isAuthorized(methodOps),
        function (req, res, next) {
            var model = req.params.model,
                collection = null,
                obj = null,
                before = null,
                after = null,
                emsg = "";
            collection = req.collection;// Set by router.param('model', ...);
            if (!collection) {
                // Should never get here if router.params did job right
                emsg = "INTERNAL ERROR: router.param let null model collection through.";
                log.error(emsg);
                res.status(404).json({ error: emsg });
                return;
            }
            obj = u.find(
                methodOps,
                function (obj) { return obj.model.toLowerCase() === model.toLowerCase(); }
            );
            before = obj.before;
            after  = obj.after;
            function send() {
                res.status(200).json({ status: "OK" });
            }
            function find(extras) {
                collection.findById(req.params.id, function (err, doc) {
                    var ex = {};
                    if (!doc) {
                        // NOTE: If doc is undefined, err may be undefined too.
                        emsg = "No " + model + " found for id = " + req.params.id;
                        log.error(emsg);
                        res.status(404).json({ error: emsg });
                        return;
                    }
                    if (err) {
                        ex = { error: "Model find error '" + model + "'", message: err.message };
                        log.error(ex);
                        res.status(404).json(ex);
                        return;
                    }
                    doc.remove(function (err) {
                        if (err) {
                            ex = { error: "Model remove error '" + model + "'", message: err.message };
                            log.error(ex);
                            res.status(404).json(ex);
                        } else {
                            if (after) {
                                after(
                                    { req: req, res: res, extras: extras },
                                    send
                                );
                            } else {
                                send();
                            }
                        }
                    });
                });
            }
            if (before) {
                before({ req: req }, find);
            } else {
                find(null);
            }
        }
    );
    return router;
};
