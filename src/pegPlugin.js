//const _ = require('lodash');

const injectInitializer = (grammar, code) => {
    if (!grammar.initializer) {
        grammar.initializer = {
            type: 'initializer',
            code: '',
            location: {
                start: {
                    offset: 0, line: 1, column: 1
                },
                end: {
                    offset: 0, line: 1, column: 1
                }
            }
        };
    }
    grammar.initializer.code = code + grammar.initializer.code || '';
    grammar.initializer.location.end.line += code.match(/\n/).length;
    grammar.initializer.location.end.offset += code.length;

    return grammar;
}

const pegPlugin = {
    transform: (grammar) => {
        const injectCode = 'const _ = require(\'lodash\'),\n        {Node, Value, VariableNode, ExpressionNode, ParameterList, ParameterDefinitionList} = require(\'./ast\')(location);';
        return injectInitializer(grammar, injectCode);
    },
    use: (config) => {
        config.passes.transform.push(pegPlugin.transform);
    }
};

module.exports = pegPlugin;