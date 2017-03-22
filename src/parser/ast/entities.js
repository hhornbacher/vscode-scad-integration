const _ = require('lodash');

function Entities(file, registerClass) {
    class Entity {
        constructor(children) {
            this._location = new Location();

            if (_.isArray(children)) {
                children = children.trim();
                this._children = _.map(children, (child) => {
                    child._parent = this;
                    return child;
                });
            }
        }

        isType(type = StatementEntity) {
            if (!this.prototype)
                return false;
            return this.prototype.isPrototypeOf(type);
        }

        get code() {

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
    registerClass(Entity);

    class BlockEntity extends Entity {
        constructor(children) {
            super(children);
        }

        isRoot() {
            return !!this._root;
        }
    }
    registerClass(BlockEntity);

    class RootEntity extends BlockEntity {
        constructor(children) {
            super(children);
            this._root = true;
            this._file = file;
        }
    }
    registerClass(RootEntity);

    class StatementEntity extends Entity {
    }
    registerClass(StatementEntity);

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
    registerClass(CommentEntity);

    class VariableEntity extends Entity {
        constructor(name, value) {
            super();
            this._name = name;

            value._parent = this;
            this._value = value;
        }
    }
    registerClass(VariableEntity);

    class IncludeEntity extends StatementEntity {
        constructor(file) {
            super();
            this._file = file;
        }
    }
    registerClass(IncludeEntity);

    class UseEntity extends IncludeEntity {
    }
    registerClass(UseEntity);

    class ModuleEntity extends StatementEntity {
        constructor(name, params, block) {
            super();
            this._name = name;

            //if (block.isType(BlockEntity)) {
            this._block = block;
            //}
            if (params.isType(ParameterListEntity)) {
                this._params = params;
            }
        }
    }
    registerClass(ModuleEntity);


    class ActionEntity extends StatementEntity {
        constructor(name, params, modifier, operators, block) {
            super();
            this._name = name;
            this._modifier = modifier;

            if (block) {
                this._block = block;
            }

            if (params.isType(ParameterListEntity)) {
                this._params = params;
            }

            if (_.isArray(operators)) {
                this._operators = _.map(operators.trim(), (operator) => {
                    operator._parent = this;
                    return operator;
                });
            }
            else
                this._operators = [];
        }
    }
    registerClass(ActionEntity);

    class ValueEntity extends StatementEntity {
        constructor(value = null, negative = false) {
            super();

            if (negative)
                this._negative = true;

            if (value)
                this._value = value;
        }
    }
    registerClass(ValueEntity);

    class NumberValue extends ValueEntity {
        constructor(value, negative = false) {
            super(value, negative);
        }
    }
    registerClass(NumberValue);

    class BooleanValue extends ValueEntity {
        constructor(value) {
            super(value);
        }
    }
    registerClass(BooleanValue);

    class StringValue extends ValueEntity {
        constructor(value) {
            super(value);
        }
    }
    registerClass(StringValue);

    class VectorValue extends ValueEntity {
        constructor(value, negative = false) {
            super(value, negative);
        }
    }
    registerClass(VectorValue);

    class RangeValue extends VectorValue {
        constructor(start, end, increment = 1) {
            super([start, end, increment]);
        }

        get start() { return this.children[0]; }
        get end() { return this.children[1]; }
        get increment() { return this.children[2]; }
    }
    registerClass(RangeValue);

    class ReferenceValue extends ValueEntity {
        constructor(name, negative = false) {
            super(null, negative);
            this._name = name;
        }
    }
    registerClass(ReferenceValue);

    class ExpressionEntity extends StatementEntity {
        constructor(terms) {
            super(terms);
        }
    }
    registerClass(ExpressionEntity);

    class TermEntity extends Entity {
        constructor(factors) {
            super(factors);
        }
    }
    registerClass(TermEntity);

    class FactorEntity extends ValueEntity {
    }
    registerClass(FactorEntity);

    class ParameterListEntity extends Entity {
        constructor(parameters, standardValuesAllowed = false) {
            super();
            this._parameters = parameters;
            this._standardValuesAllowed = standardValuesAllowed;
            this._parent = null;
        }
    }
    registerClass(ParameterListEntity);

    class ParameterEntity extends ExpressionEntity {
        constructor(value = null) {
            super();
            if (value)
                this._value = value;
        }
    }
    registerClass(ParameterEntity);
};

module.exports = Entities;