const _ = require('lodash');

function Entities(location, registerClass) {
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
    registerClass(Entity);

    class BlockEntity extends Entity {
        constructor(children = []) {
            super(children);
        }

        isRoot() {
            return !!this._root;
        }
    }
    registerClass(BlockEntity);

    class RootEntity extends BlockEntity {
        constructor(children = []) {
            super(children);
            this._root = true;
        }
    }
    registerClass(RootEntity);

    class StatementEntity extends Entity {
        constructor(children) {
            super(children);
        }
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

            console.log(name, value);
            this._name = name;

            value.parent = this;
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

    class UseEntity extends StatementEntity {
        constructor(file) {
            super();
            this._file = file;
        }
    }
    registerClass(UseEntity);

    class ModuleEntity extends StatementEntity {
        constructor(name, params, children = null) {
            super('Module', params, children);
            this.name = name;
            this._parent = null;
        }
    }
    registerClass(ModuleEntity);

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
            super({ start, end, increment });
        }
    }
    registerClass(RangeValue);

    class ReferenceValue extends ValueEntity {
        constructor(name, negative = false) {
            super(name, negative);
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
            this._parent = null;
        }
    }
    registerClass(ParameterListEntity);

    class ParameterEntity extends ExpressionEntity {
        constructor(name, value = null) {
            super();
            if (name)
                this._name = name;
        }
    }
    registerClass(ParameterEntity);
};

module.exports = Entities;