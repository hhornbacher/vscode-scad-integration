const _ = require('lodash');

module.exports = (location, file) => {

    class AST {
        constructor() {
            this._entities = [];
            this._tree = new RootEntity(this);
            this._file = file;
        }

        get root() {
            return this._tree;
        }

        set tree(x) {
            return this._tree;
        }

        set entities(x) {
            return this._entities;
        }
    }

    class Location {
        constructor() {
            this._location = location();
        }
    }

    class Entity {
        constructor(children = null) {
            this._location = new Location();
            this._parent = null;
            this._type = this.name.replace('Entity','');


            if (children) {
                this._children = _.map(children, (child) => {
                    child.parent = this;
                    return child;
                });
            }
        }

        addChild(child) {
            if (child instanceof StatementEntity) {
                child.parent = this;
                this._children.push(child);
            }

            else
                throw new SyntaxError(`Wrong argument 'child' type: ${typeof children}, expected: StatementEntity`);
        }

        addChildren(children) {
            if (_.isArray(children))
                _.each(children, child => this.addChild(child));
            else
                throw new SyntaxError(`Wrong argument 'children' type: ${typeof children}, expected: array`);
        }

        getParentNode() {
            return this._parent;
        }

        getType() {
            return this._type;
        }

        getChildNode(index = null) {
            if (_.isNumber(index) && index >= 0)
                return this._children[index];
            else
                return this._children;
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

    class RootEntity extends Entity {
        constructor(children = [], ast) {
            super('Root', children);
            this.ast = ast;
        }
    }

    console.log(RootEntity.name);

    class CommentEntity extends Entity {
        constructor(text, multiline = false) {
            super();

            this._text = text;
            this._multiline = multiline;

            this._parent = null;
        }
    }

    class StatementEntity extends Entity {
        constructor(name, expression) {
            super('Variable');

            this.name = name;

            expression.parent = this;
            this._data = expression;

            this._parent = null;
        }
    }

    class VariableEntity extends Entity {
        constructor(name, expression) {
            super('Variable');

            this.name = name;

            expression.parent = this;
            this._data = expression;

            this._parent = null;
        }
    }

    class ExpressionEntity extends Entity {
        constructor(expression) {
            super('Expression');

            expression.parent = this;
            this._data = expression;

            this._parent = null;
        }
    }

    class ModuleEntity extends Entity {
        constructor(name, params, children = null) {
            super('Module', params, children);
            this.name = name;
            this._parent = null;
        }
    }

    class ValueEntity extends Entity {
        constructor(value = null, negative = false) {
            super();

            if (negative)
                this.negative = true;
            else
                this.negative = false;

            if (value)
                this._value = value;

            this._parent = null;
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

    console.log(this);

    return {
        Entity, RootEntity, StatementEntity, ValueEntity, ReferenceValue, NumberValue, BooleanValue, StringValue, VectorValue, RangeValue, ParameterListEntity, ParameterDefinitionList, VariableEntity, ExpressionEntity, ModuleEntity
    };
};