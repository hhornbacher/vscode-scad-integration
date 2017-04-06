const _ = require('lodash');

function Entities(file, registerClass) {
    class Node {
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

        isType(type = StatementNode) {
            if (!_.isFunction(type) || !type.name || !/.*Node/.test(type.name))
                throw Error('Wrong parameter type!');
            if (!this.prototype)
                return false;
            return this.prototype.isPrototypeOf(type) || false;
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
            return this._children || null;
        }

        getChildrenOfType(type) {
            if (!this._children)
                return null;
            if (!type)
                return this._children;

            return _.find(this._children, (child) => child.isType(type));
        }
    }
    registerClass(Node);

    class BlockNode extends Node {
        constructor(children) {
            super(children);
        }

        isRoot() {
            return !!this._root;
        }
    }
    registerClass(BlockNode);

    class RootNode extends BlockNode {
        constructor(children) {
            super(children);
            this._root = true;
            this._file = file;
        }
    }
    registerClass(RootNode);

    class StatementNode extends Node {
    }
    registerClass(StatementNode);

    class CommentNode extends StatementNode {
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
    registerClass(CommentNode);

    class VariableNode extends Node {
        constructor(name, value) {
            super();
            this._name = name;

            value._parent = this;
            this._value = value;
        }
    }
    registerClass(VariableNode);

    class IncludeNode extends StatementNode {
        constructor(file) {
            super();
            this._file = file;
        }
    }
    registerClass(IncludeNode);

    class UseNode extends IncludeNode {
    }
    registerClass(UseNode);

    class ModuleNode extends StatementNode {
        constructor(name, params, block) {
            super();
            this._name = name;

            //if (block.isType(BlockNode)) {
            this._block = block;
            //}
            if (params.isType(ParameterListNode)) {
                this._params = params;
            }
        }
    }
    registerClass(ModuleNode);

    class ForLoopNode extends StatementNode {
        constructor(params, block) {
            super();

            if (block) {
                this._block = block;
            }

            if (params.isType(ForLoopParameterListNode)) {
                this._params = params;
            }
        }
    }
    registerClass(ForLoopNode);

    class ActionNode extends StatementNode {
        constructor(name, params, modifier, operators, block) {
            super();
            this._name = name;
            this._modifier = modifier;

            if (block) {
                this._block = block;
            }

            //if (params.isType(ParameterListNode)) {
                this._params = params;
            //}

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
    registerClass(ActionNode);

    class ValueNode extends StatementNode {
        constructor(value = null, negative = false) {
            super();

            if (negative)
                this._negative = true;

            if (value)
                this._value = value;
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
            super(null, negative);
            this._name = name;
        }
    }
    registerClass(ReferenceValue);

    class ExpressionNode extends StatementNode {
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
            super();
            this._parameters = parameters;
            this._standardValuesAllowed = standardValuesAllowed;
        }
    }
    registerClass(ParameterListNode);

    class ForLoopParameterListNode extends Node {
        constructor(parameters) {
            super();
            this._parameters = parameters;
        }
    }
    registerClass(ParameterListNode);

    class ParameterNode extends ExpressionNode {
        constructor(value = null) {
            super();
            if (value)
                this._value = value;
        }
    }
    registerClass(ParameterNode);
};

module.exports = Entities;