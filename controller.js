/**
 * controller.js
 */

"use strict";

function Controller() {
    this.name    = require("./package").name;
    this.version = require("./package").version;
    this.m_parent = null;
    this.m_router = null;
    this.m_prefix = null;
    this.m_controller = [];
    this.m_options = {};
}

module.exports = Controller; // For export

Controller.prototype.clear = function () {
    this.m_controller = [];
    return this;
};

Controller.prototype.parent = function (p) {
    this.m_parent = p;
    return this;
};

Controller.prototype.router = function (r) {
    this.m_router = r;
    return this;
};

Controller.prototype.prefix = function (p) {
    this.m_prefix = p;
    return this;
};

Controller.prototype.setup = function (ops) {
    this.m_options = ops || {};
    return this;
};

Controller.prototype.install = function (app) {
    var params = require('./controllers/params').parent(this.m_parent),
        info = {};
    this.m_router.param('model', params.model);
    this.m_router.param('id',    params.id);
    info = {
        parent: this.m_parent,
        router: this.m_router,
        prefix: this.m_prefix
    };
    if (this.m_options.getOne) {
        this.m_controller.push(require('./controllers/get-one')(info, this.m_options.getOne));
    }
    if (this.m_options.getMany) {
        this.m_controller.push(require('./controllers/get-many')(info, this.m_options.getMany));
    }
    if (this.m_options.post) {
        this.m_controller.push(require('./controllers/post')(info, this.m_options.post));
    }
    if (this.m_options.del) {
        this.m_controller.push(require('./controllers/del')(info, this.m_options.del));
    }
    if (this.m_options.put) {
        this.m_controller.push(require('./controllers/put')(info, this.m_options.put));
    }
    if (this.m_options.patch) {
        this.m_controller.push(require('./controllers/patch')(info, this.m_options.patch));
    }
    if (!this.m_controller.length) {
        // If 0 will get TypeError: app.use() requires middleware functions
        throw new Error("richmond-web-controller - activate at least one HTTP route");
    }
    app.use(
        this.m_parent.prefix(),
        this.m_controller
    );
};