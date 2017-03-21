const _ = require('lodash'),
    fs = require('fs');


Array.prototype.trim = function () {
    return _.filter(this, obj => !_.isNull(obj));
}

Array.prototype.toString = function () {
    return this.join('');
}

const registerClass = function (c) {
    global[c.name] = c;
};

module.exports = (location, file) => {
    require('./errors')(location, file, registerClass);


    class AST {
        constructor(entites) {
            this._entities = [];
            this._root = new RootEntity();
            this.addEntities(entites);
            this._file = file;
        }

        get root() {
            return this._root;
        }

        addEntity(entity) {
            this._root.addChild(entity);
            this._entities.push(entity);
        }

        addEntities(entites) {
            _.each(entites, entity => this.addEntity(this._root, entity))
        }

        get tree() {
            return this._tree;
        }

        get entities() {
            return this._entities;
        }
    }
    registerClass(AST);

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


    require('./entities')(location, registerClass);
};

module.exports((x) => {
    return { mock: true }
}, './mock');

console.log(global);