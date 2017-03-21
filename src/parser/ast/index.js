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

    class CodeFile {
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
    registerClass(CodeFile);

    class Location {
        constructor() {
            _.each(location(), (data, key) => {
                this[key] = data;
            });
        }

        toString() {
            return JSON.stringify(this, null, 2);
        }
    }
    registerClass(Location);

    require('./errors')(file, registerClass);
    require('./entities')(file, registerClass);
};