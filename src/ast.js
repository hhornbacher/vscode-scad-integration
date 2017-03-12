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
        constructor(type, data, children = null) {
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
        constructor({ name, expression }, children = null) {
            super('Variable', null, children);
            if (name)
                this.name = name;

            if (expression){
                expression.parent = this;
                this.data = expression;
            }

            this.parent = null;
        }
    }

    class ExpressionNode extends Node {
        constructor(expression, children = null) {
            super('Expression', null, children);
            
            if (expression){
                expression.parent = this;
                this.data = expression;
            }

            this.parent = null;
        }
    }

    class Value extends Entity {
        constructor(value, negative = false, ref = false) {
            if (ref)
                super('Reference');
            else if (_.isNumber(value))
                super('Number');
            else if (_.isString(value))
                super('String');
            else if (_.isArray(value))
                super('Vector');
            else
                super('Value');

            if (negative)
                this.negative = true;
            else
                this.negative = false;

            this.value = value;
            this.parent = null;
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
        Node, Value, ParameterList, ParameterDefinitionList, VariableNode, ExpressionNode
    };
};