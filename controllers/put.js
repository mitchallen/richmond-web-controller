/**
 * ./controllers/put.js
 */

"use strict";

/*jslint unparam: true, nomen: true*/

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
        methodOps  = mOps || {};
    router.put(
        '/:model/:id',
        m_ssl.isSSL(prefix, methodOps),
        m_rights.isAuthorized(methodOps),
        function (req, res, next) {
            var model = req.params.model,
                emsg = null,
                obj = null,
                before = null,
                after = null,
                id    = req.params.id,  // Validated by params.id - but may not exist
                collection = req.collection; // Set by router.param('model', ...);
            if (!collection) {
                // Should never get here if router.params did job right
                emsg = "INTERNAL ERROR: router.param let null model collection through.";
                log.error(emsg);
                res.status(500).json({ error: emsg });
                return;
            }
            if (!id) {
                emsg = "INTERNAL ERROR: router.id let null ID through";
                log.error(emsg);
                res.status(500).json({ error: emsg });
                return;
            }
            obj = u.find(
                methodOps,
                function (obj) { return obj.model.toLowerCase() === model.toLowerCase(); }
            );
            before = obj.before;
            after  = obj.after;
            function send() {
                res.sendStatus(204);    // 204 - not returning data
            }
            function update(body, options, _extras) {
                    // Does a merge - not very RESTful?
                collection.update(
                    {
                        _id : req.params.id
                    },
                    {
                        $set : body
                    },
                    options, // options
                    function (err, numAffected) {
                        // numAffected is the number of updated documents
                        if (err) {
                            log.error(err);
                            return res.status(403).json({ error: err.message });
                        }
                        if (after) {
                            after(
                                {
                                    req: req,
                                    res: res,
                                    numAffected: numAffected,
                                    extras: _extras
                                },
                                send
                            );
                        } else {
                            send();
                        }
                    }
                );
            }
            if (before) {
                before({ req: req }, update);
            } else {
                update(req.body, {}, null);
            }
        }
    );
    return router;
};