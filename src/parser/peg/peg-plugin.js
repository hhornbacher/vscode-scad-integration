const fs = require('fs'),
  _ = require('lodash');

const initializerCode = fs.readFileSync(require.resolve('./peg-initializer'), 'utf8');

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
    grammar = injectInitializer(grammar, initializerCode);
    return grammar;
  },
  use: (config) => {
    console.log(config);
    config.passes.transform.push(pegPlugin.transform);
  }
};

module.exports = pegPlugin;