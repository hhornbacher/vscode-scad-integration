const fs = require('fs'),
  _ = require('lodash');

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

const returnMagic = (grammar, code) => {
  const scanTree = (node, parent = null) => {

  };


  _.each(grammar.rules, rule => {
    if (!rule.code)
      console.log(require('util').inspect(rule, { showHidden: true, depth: null }));
  });
  return grammar;
}


const initializerCode = fs.readFileSync(require.resolve('./peg-initializer'), 'utf8');
const pegPlugin = {
  transform: (grammar) => {
    //console.log(require('util').inspect(grammar, { showHidden: true, depth: null }));
    grammar = injectInitializer(grammar, initializerCode);
    grammar = returnMagic(grammar, initializerCode);
    return grammar;
  },
  use: (config) => {
    config.passes.transform.push(pegPlugin.transform);
  }
};

module.exports = pegPlugin;