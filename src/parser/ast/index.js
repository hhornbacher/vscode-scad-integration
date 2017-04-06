const _ = require('lodash'),
    fs = require('fs');


Array.prototype.trim = function () {
    return _.filter(this, obj => !_.isNull(obj));
}

Array.prototype.toString = function () {
    return this.join('');
}


module.exports = (location, file) => {

    const registerClass = function (c) {
        global[c.name] = c;
    };

/*    class CodeFile {
        constructor(file, content = null) {
            if (content === null)
                content = fs.readFileSync(file, 'utf8');

            this._content;
            this._lines = content.split('\n');
        }

        get length() {
            return this._content.length;
        }

        get lineCount() {
            return this._lines.length;
        }

        get lines() {
            return this._lines;
        }
    }
    registerClass(CodeFile);*/

    class Location {
        constructor(loc = null) {
            if (loc === null)
                _.each(location(), (data, key) => {
                    this[key] = data;
                });
            else {
                _.each(loc, (data, key) => {
                    this[key] = data;
                });
            }
        }

        toString() {
            return JSON.stringify(this, null, 2);
        }
    }
    registerClass(Location);


    class Trace {
        constructor({ type, rule, location }) {
            this.type = type.replace('rule.', '');
            this.rule = rule;
            this.location = new Location(location);
        }
    }
    registerClass(Trace);

    class SCADTracer {
        constructor() {
            this._trace = [];
        }

        trace(current) {
            this._trace.push(new Trace(current));
        }

        getTrace() {
            return this._trace;
        }
    }
    registerClass(SCADTracer);


    require('./errors')(file, registerClass);
    require('./nodes')(file, registerClass);
};