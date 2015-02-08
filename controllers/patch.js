/**
 * ./controllers/patch.js
 */

"use strict";

/*jslint unparam: true, nomen: true*/

var jsonpatch = require('fast-json-patch'),
    m_ssl = require('../lib/ssl'),
    m_rights = require('../lib/rights'),
    LogError = require('../lib/log-error'),
    u = require("underscore");

module.exports = function (parentInfo, mOps) {
    var info = parentInfo || {},
        parent = info.parent || {},
        log = new LogError(parent.log),
        router = info.router,
        prefix = info.prefix,
        methodOps  = mOps || {};

    /*
     * Example call:
     * 
     * $ curl -i -X PATCH -H "Content-Type: application/json" 
     * -d '[{"op":"replace","path":"/status","value":"PATCH THE STATUS"}]' 
     * http://localhost:3030/api/mytest/54ce741e470103ca057b0098
     */

    router.patch(
        '/:model/:id',
        m_ssl.isSSL(prefix, methodOps),
        m_rights.isAuthorized(methodOps),
        function (req, res, next) {
            var model = req.params.model,
                emsg = "",
                ex = {},
                obj = null,
                before = null,
                after = null,
                send = null,
                patch = null,
                collection = req.collection; // Set by router.param('model', ...);
            if (!collection) {
                // Should never get here if router.params did job right
                emsg = "INTERNAL ERROR: router.param let null model collection through.";
                log.error(emsg);
                return next({ status: 500, message: emsg, type: 'internal'});
            }
            obj = u.find(
                methodOps,
                function (obj) { return obj.model.toLowerCase() === model.toLowerCase(); }
            );
            before = obj.before;
            after  = obj.after;
            send = function (d) {
                res.status(200).json(d);
            };
            patch = function (body, source, m_extras) {
                var patches = body;
                jsonpatch.apply(source, patches);
                source.save(function (err) {
                    if (err) {
                        ex = { status: 500, message: 'ERROR patching document', type: 'internal'};
                        log.error(ex);
                        return next(ex);
                    }
                });
                if (after) {
                    after(
                        {
                            req: req,
                            res: res,
                            result: source,
                            patches: patches,
                            extras: m_extras
                        },
                        send
                    );
                } else {
                    send(source);
                }
            };
            collection.findOne({ _id : req.params.id }, function (err, doc) {
                if (err) {
                    emsg = "Model find error '" + model + "' not found. [2]";
                    log.error(emsg);
                    return next({ status: 404, message: emsg, type: 'user' });
                }
                if (before) {
                    before({ req: req, doc: doc }, patch);
                } else {
                    patch(req.body, doc, null);
                }
            });
        }
    );
    return router;
};
