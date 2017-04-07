const _ = require('lodash');

function Entities(file, registerClass) {

    class Node extends ASTBaseClass {
        constructor(children, privateProps = {}) {
            privateProps = _.merge({
                _location: new Location(),
                parent: null
            }, privateProps);

            if (_.isArray(children)) {
                children = children.trim();
                privateProps._children = children;
            }

            super(privateProps);

            if (_.isArray(children)) {
                _.each(children, (child) => {
                    child.parent = this;
                });
            }
        }

        isType(type = Node) {
            if (!_.isFunction(type) || !type.name || !/.*Node/.test(type.name))
                throw Error('Wrong parameter type!');
            if (!this.prototype)
                return false;
            return this.prototype.isPrototypeOf(type) || false;
        }

        getChildrenOfType(type) {
            if (!this.children)
                return null;
            if (!type)
                return this.children;

            return _.find(this.children, (child) => child.isType(type));
        }
    }
    registerClass(Node);

    class BlockNode extends Node {
        constructor(children, privateProps) {
            super(children, privateProps);
        }
    }
    registerClass(BlockNode);

    class RootNode extends BlockNode {
        constructor(children) {
            super(children, {
                _root: true,
                _file: file
            });
        }
    }
    registerClass(RootNode);

    class CommentNode extends Node {
        constructor(text, multiline = false) {
            super(null, {
                _text: text,
                _multiline: multiline
            });
        }
    }
    registerClass(CommentNode);

    class VariableNode extends Node {
        constructor(name, value) {
            super(null, {
                _name: name,
                _value: value
            });
            value._parent = this;
        }
    }
    registerClass(VariableNode);

    class IncludeNode extends Node {
        constructor(file) {
            super(null, {
                _file: file
            });
        }
    }
    registerClass(IncludeNode);

    class UseNode extends IncludeNode {
    }
    registerClass(UseNode);

    class ModuleNode extends Node {
        constructor(name, params, block) {
            let privateProps = {
                _name: name,
                _block: block,
                _params: params
            };
            super(null, privateProps);
        }
    }
    registerClass(ModuleNode);

    class ForLoopNode extends Node {
        constructor(params, block) {
            let privateProps = {
                _block: block,
                _params: params
            };
            super(null, privateProps);
        }
    }
    registerClass(ForLoopNode);

    class ActionNode extends Node {
        constructor(name, params, modifier, operators, block) {
            let privateProps = {
                _name: name,
                _modifier: modifier,
                _params: params
            };
            if (block) {
                privateProps._block = block;
            }

            if (_.isArray(operators)) {
                operators = operators.trim();
                privateProps._operators = operators;
            }

            super(null, privateProps);

            if (_.isArray(operators)) {
                _.each(operators, (operator) => {
                    operator.parent = this;
                });
            }
        }
    }
    registerClass(ActionNode);

    class ValueNode extends Node {
        constructor(value = null, negative = false, privateProps = {}) {
            super(null, _.merge({
                _value: value,
                _negative: negative
            }, privateProps));
        }
    }
    registerClass(ValueNode);

    class NumberValue extends ValueNode {
        constructor(value, negative = false) {
            super(value, negative);
        }
    }
    registerClass(NumberValue);

    class BooleanValue extends ValueNode {
        constructor(value) {
            super(value);
        }
    }
    registerClass(BooleanValue);

    class StringValue extends ValueNode {
        constructor(value) {
            super(value);
        }
    }
    registerClass(StringValue);

    class VectorValue extends ValueNode {
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

    class ReferenceValue extends ValueNode {
        constructor(name, negative = false) {
            super(null, negative, {
                _name: name
            });
        }
    }
    registerClass(ReferenceValue);

    class ExpressionNode extends Node {
        constructor(terms) {
            super(terms);
        }
    }
    registerClass(ExpressionNode);

    class TermNode extends Node {
        constructor(factors) {
            super(factors);
        }
    }
    registerClass(TermNode);

    class FactorNode extends ValueNode {
    }
    registerClass(FactorNode);

    class ParameterListNode extends Node {
        constructor(parameters, standardValuesAllowed = false) {
            super(null, {
                _parameters: parameters,
                _standardValuesAllowed: standardValuesAllowed
            });
        }
    }
    registerClass(ParameterListNode);

    class ForLoopParameterListNode extends Node {
        constructor(parameters) {
            super(null, {
                _parameters: parameters
            });
        }
    }
    registerClass(ForLoopParameterListNode);

    class ParameterNode extends ExpressionNode {
        constructor(value) {
            super([value]);
        }
    }
    registerClass(ParameterNode);
};

module.exports = Entities;