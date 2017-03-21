const _ = require('lodash'),
    fs = require('fs');


Array.prototype.trim = function () {
    return _.filter(this, obj => !_.isNull(obj));
}

Array.prototype.toString = function () {
    return this.join('');
}

module.exports = (location, file) => {

    class SCADTypeError extends TypeError {
        constructor(message, entity) {
            super(message);
            this.entity = entity;
        }
    }

    class SCADSyntaxError extends SyntaxError {
        constructor(message, entity, stack = null) {
            super(message);
            this.entity = entity;
        }
    }

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

    class Entity {
        constructor(children = null, code = '') {
            this._location = new Location();
            this._parent = null;
            //console.log(this);
            //this._type = this.name.replace('Entity', '');
            this._code = code;

            //console.log(children);
            if (_.isArray(children)) {
                this._children = _.map(children, (child) => {
                    child.parent = this;
                    return child;
                });
            }
            else
                this._children = [];
        }

        isType(type = StatementEntity) {
            if (!this.prototype)
                return false;
            return this.prototype.isPrototypeOf(type);
        }

        get parent() {
            return this._parent;
        }

        set parent(parent = null) {
            this._parent = parent;
        }

        get type() {
            return this._type;
        }

        get children() {
            return this._children;
        }

        addChild(child) {
            if (child.isType(StatementEntity)) {
                child.parent = this;
                this._children.push(child);
            }

            else
                throw new SCADSyntaxError(`Wrong argument 'child' type: ${child.constructor.name}, expected: StatementEntity or CommentEntity`, child);
        }

        addChildren(children) {
            if (_.isArray(children))
                _.each(children, child => this.addChild(child));
        }

        findEntityByType(type) {
            let results = [];

            if (this.name === type)
                results.push(this);

            if (this._children) {
                const recurse = (children, depth = 0, limit = 10) => {
                    _.each(children, child => {
                        if (child.type === type)
                            results.push(child);
                        if (depth < limit) {
                            if (child.children) {
                                recurse(child.children, depth + 1);
                            }
                        }
                    });
                };
                recurse(this._children);
            }

            return results;
        }
    }

    class BlockEntity extends Entity {
        constructor(children = []) {
            super(children);
        }

        isRoot() {
            return !!this._root;
        }
    }

    class RootEntity extends BlockEntity {
        constructor(children = []) {
            super(children);
            this._root = true;
        }
    }

    class StatementEntity extends Entity {
        constructor(children) {
            super(children);
        }
    }

    class CommentEntity extends StatementEntity {
        constructor(text, multiline = false) {
            super();

            this._text = text;
            this._multiline = multiline;
        }

        get text() {
            return this._text;
        }

        get multiline() {
            return this._multiline;
        }
    }

    class VariableEntity extends Entity {
        constructor(name, value) {
            super();

            console.log(name, value);
            this._name = name;

            value.parent = this;
            this._value = value;
        }
    }

    class IncludeEntity extends StatementEntity {
        constructor(file) {
            super();
            this._file = file;
        }
    }

    class UseEntity extends StatementEntity {
        constructor(file) {
            super();
            this._file = file;
        }
    }

    class ModuleEntity extends StatementEntity {
        constructor(name, params, children = null) {
            super('Module', params, children);
            this.name = name;
            this._parent = null;
        }
    }

    class ValueEntity extends StatementEntity {
        constructor(value = null, negative = false) {
            super();

            if (negative)
                this.negative = true;
            else
                this.negative = false;

            if (value)
                this._value = value;
        }
    }

    class NumberValue extends ValueEntity {
        constructor(value, negative = false) {
            super(value, negative);
        }
    }

    class BooleanValue extends ValueEntity {
        constructor(value) {
            super(value);
        }
    }

    class StringValue extends ValueEntity {
        constructor(value) {
            super(value);
        }
    }

    class VectorValue extends ValueEntity {
        constructor(value, negative = false) {
            super(value, negative);
        }
    }

    class RangeValue extends VectorValue {
        constructor(start, end, increment = 1) {
            super({ start, end, increment });
        }
    }

    class ReferenceValue extends ValueEntity {
        constructor(name, negative = false) {
            super(name, negative);
        }
    }

    class ExpressionEntity extends StatementEntity {
        constructor(terms) {
            super(terms);
        }
    }

    class TermEntity extends Entity {
        constructor(factors) {
            super(factors);
        }
    }

    class FactorEntity extends ValueEntity {
    }

    class ParameterListEntity extends Entity {
        constructor(parameters, standardValuesAllowed = false) {
            super();
            this._parameters = parameters;
            this._parent = null;
        }
    }

    class ParameterEntity extends ExpressionEntity {
        constructor(name, value = null) {
            super();
            if (name)
                this._name = name;
        }
    }

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


    var classes = {};
    _.each(module.exports.toString().match(/class\s+([A-Za-z]+)[^{]+{/g),
        match => {
            const name = match.replace(/class\s+([A-Za-z]+).*/, '$1');
            //TODO: find more elegant solution!!
            eval(`classes['${name}'] = ${name};`);
            eval(`global['${name}'] = ${name};`);
        }
    );

    return classes;
};