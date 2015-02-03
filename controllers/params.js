/**
 * params.js
 */

"use strict";

/*jslint unparam: true*/

var m_parent = null;

module.exports = {
    parent: function (p) {
        m_parent = p;
        return this;
    },
    model: function (req, res, next, model) {
        // store id or other info in req
        var collection = m_parent.model(model),
            emsg = "";
        // return 404 otherwise ???
        if (!collection) {
            emsg = "PARAM: Model '" + model + "' not found. [1]";
            if (m_parent.log) {
                m_parent.log.error(emsg);
            } else {
                console.error(emsg);
            }
            res.status(404).json({ error: emsg });
            return;    // stop
        }
        // call next when done
        req.collection = collection;
        next();
    },
    id: function (req, res, next, id) {
        // console.log("DEBUG: params - id");
        // IF ID is invalid methods may return: 
        // CastError: Cast to ObjectId failed for value "<bad id" at path "_id"
        // So need to intercept.
        // NOTE: an id of 'thisisabadid' got through as valid ???
        if (!m_parent.mongoose.Types.ObjectId.isValid(req.params.id)) {
            var emsg = "PARAM: id '" + req.params.id + "' is not in a valid MongoDB ObjectID format";
            if (m_parent.log) {
                m_parent.log.error(emsg);
            } else {
                console.error(emsg);
            }
            res.status(404).json({ error: emsg });
            return;    // stop
        }
        // call next when done
        // No need to set ID - next function will get from req.param.id
        next();
    }
};