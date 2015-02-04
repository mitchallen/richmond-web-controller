/**
 * rights.js
 */

"use strict";

/*jslint unparam: true*/

var lib = {},
    u = require("underscore"),
    m_roles = [ "none", "admin", "user", "public" ],
    m_secret = null,
    m_rightsAccess = {
        // rights : [ roles that can access ]
        "admin"  : [ "admin" ],
        "user"   : [ "admin", "user" ],
        "public" : [ "admin", "user", "public" ]
    };

module.exports = lib;

lib.secret = function (s) {
    m_secret = s;
};

lib.validateRole = function (role) {
    if (!role) {
        console.error("ERROR: role name can't be null.");
        return null;
    }
    if (role.match(/\s+/)) {
        console.error("ERROR: role name must not contain whitepace");
        return null;
    }
    role = role.toLowerCase();
    if (m_roles.indexOf(role.toLowerCase()) < 0) {
        console.error("ERROR: role TYPE '" + role + "' NOT FOUND.");
        return null;
    }
    return role;
};

lib.hasRights = function (rights, role) {
    return (m_rightsAccess[rights.toLowerCase()].indexOf(role.toLowerCase()) >= 0);
};

lib.getRights = function (model, methodOps) {
    var obj = null,
        rights = null;
    obj = u.find(
        methodOps,
        function (obj) { return obj.model.toLowerCase() === model.toLowerCase(); }
    );
    rights = undefined;
    if (obj) {
        rights = obj.rights.toLowerCase();
    }
    return rights;
};

lib.isAuthorized = function (methodOps) {
    return function (req, res, next) {
        var emsg = "",
            model = null,
            token = null,
            rights = null;
        if (!req) {
            emsg = "INTERNAL ERROR (isAuthorized): req not defined.";
            return next({ status: 500, message: emsg, type: 'internal'});
        }
        model = req.params.model;
        token = req.token;
        rights = lib.getRights(model, methodOps);
        if (!rights) {
            emsg = "No Access";
            return next({ status: 403, message: emsg, type: 'authorization'});
        }
        if (rights.toLowerCase() === "public") {
            if (!next) {
                throw new Error("next is not defined.");
            }
            return next();
        }
        if (!token) {
            emsg = "You must be logged in to access resource.";
            return next({ status: 401, message: emsg, type: 'authorization'});
        }
        if (!token.role) {
            emsg = "ROLE NOT DEFINED";
            return next({ status: 401, message: emsg, type: 'authorization'});
        }
        if (lib.hasRights(rights, token.role)) {
            return next();
        }
        emsg = "ACCESS DENIED.";
        return next({ status: 401, message: emsg, type: 'authorization'});
    };
};