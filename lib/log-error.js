/**
 * log-error.js
 */

"use strict";

function LogError(log) {
    this.log = log;
}

module.exports = LogError; // For export

LogError.prototype.error = function (emsg) {
    if (this.log) {
        this.log.error(emsg);
    } else {
        console.error(emsg);
    }
    return this;
};
