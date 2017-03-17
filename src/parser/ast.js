const _ = require('lodash');

module.exports = (location) => {

    class Location {
        constructor() {
            this._location = location();
        }
    }

    class Entity {
        constructor(type) {
            this.type = type;
            this.location = new Location();
        }
    }

    class Node extends Entity {
        constructor(type, data = {}, children = null) {
            super(type);
            if (data)
                this.data = data;
            if (children) {
                this.children = _.map(children, (child) => {
                    child.parent = this;
                    return child;
                });
            }
            this.parent = null;
        }

        findNodeByType(type) {
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

    class VariableNode extends Node {
        constructor(name, expression) {
            super('Variable');

            this.name = name;

            expression.parent = this;
            this.data = expression;

            this.parent = null;
        }
    }

    class ExpressionNode extends Node {
        constructor(expression) {
            super('Expression');

            expression.parent = this;
            this.data = expression;

            this.parent = null;
        }
    }

    class ModuleNode extends Node {
        constructor(name, params, children = null) {
            super('Module', params, children);
            this.name = name;
            this.parent = null;
        }
    }

    class Value extends Entity {
        constructor(type='Value', value=null, negative = false) {
            super(type);

            if (negative)
                this.negative = true;
            else
                this.negative = false;

            if (value)
                this.value = value;

            this.parent = null;
        }
    }

    class NumberValue extends Value {
        constructor(value, negative = false) {
            super('Number', value, negative);
        }
    }

    class BooleanValue extends Value {
        constructor(value) {
            super('Boolean', value);
        }
    }

    class StringValue extends Value {
        constructor(value) {
            super('String', value);
        }
    }

    class VectorValue extends Value {
        constructor(value, negative = false) {
            super('Vector', value, negative);
        }
    }

    class RangeValue extends Value {
        constructor(start, end, increment=1) {
            super('Range', {start, end, increment});
        }
    }

    class ReferenceValue extends Value {
        constructor(name, negative = false) {
            super('Reference',name,negative);
        }
    }

    class ParameterList extends Entity {
        constructor(parameters) {
            super('ParameterList');
            this.parameters = parameters;
            this.parent = null;
        }
    }

    class ParameterDefinitionList extends ParameterList {
        constructor(parameters) {
            super(parameters);
            this.type = 'ParameterDefinitionList';
        }
    }

    return {
        Node, Value, ReferenceValue, NumberValue, BooleanValue, StringValue, VectorValue, RangeValue, ParameterList, ParameterDefinitionList, VariableNode, ExpressionNode, ModuleNode
    };
};