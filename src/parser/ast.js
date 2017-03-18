const _ = require('lodash');

module.exports = (location, file) => {

    console.log(file, location);

    class Location {
        constructor() {
            this._location = location();
        }
    }

    class Entity {
        constructor(children = null) {
            this.location = new Location();
            if (children) {
                this.children = _.map(children, (child) => {
                    child.parent = this;
                    return child;
                });
            }
            this.parent = null;
        }

        addChild(child) {
            if (child instanceof StatementEntity) {
                child.parent = this;
                this.children.push(child);
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

        findEntityByType(type) {
            let results = [];

            if (this.type === type)
                results.push(this);

            if (this.children) {
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
                recurse(this.children);
            }

            return results;
        }
    }

    class RootEntity extends Entity {
        constructor(RootEntity = []) {
            super('Root', children);
        }
    }

            console.log(RootEntity.name);

    class CommentEntity extends Entity {
        constructor(text, multiline = false) {
            super('CommentEntity');

            this.text = text;
            this.multiline = multiline;

            this.parent = null;
        }
    }

    class StatementEntity extends Entity {
        constructor(name, expression) {
            super('Variable');

            this.name = name;

            expression.parent = this;
            this.data = expression;

            this.parent = null;
        }
    }

    class VariableEntity extends Entity {
        constructor(name, expression) {
            super('Variable');

            this.name = name;

            expression.parent = this;
            this.data = expression;

            this.parent = null;
        }
    }

    class ExpressionEntity extends Entity {
        constructor(expression) {
            super('Expression');

            expression.parent = this;
            this.data = expression;

            this.parent = null;
        }
    }

    class ModuleEntity extends Entity {
        constructor(name, params, children = null) {
            super('Module', params, children);
            this.name = name;
            this.parent = null;
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
                this.value = value;

            this.parent = null;
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

    class ParameterListEntityEntity extends Entity {
        constructor(parameters) {
            super();
            this.parameters = parameters;
            this.parent = null;
        }
    }

    class ParameterDefinitionList extends ParameterListEntity {
        constructor(parameters) {
            super(parameters);
            this.type = 'ParameterDefinitionList';
        }
    }

    console.log(this);

    return {
        Entity, RootEntity, StatementEntity, Value, ReferenceValue, NumberValue, BooleanValue, StringValue, VectorValue, RangeValue, ParameterListEntity, ParameterDefinitionList, VariableEntity, ExpressionEntity, ModuleEntity
    };
};