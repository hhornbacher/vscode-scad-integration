const _inspect = require('util').inspect;
global.inspect = (obj) => console.log(_inspect(obj, { showHidden: true, depth: null}));

const _ = require('lodash'),
  fs = require('fs'),
  pegParser = require('./scad-peg-parser');


const SCADParser = module.exports = {
  cache: [],
  getAST: (file = 'virtual', code = null) => {
    if (SCADParser.cache[file])
      return SCADParser.cache[file];

    if (code) {
      try {
        SCADParser.cache[file] = pegParser.parse(code, {
          file: file
        });
      } catch (error) {
        console.log(error, '\n', error.location);
      }
    }
    else {
      SCADParser.cache[file] = pegParser.parse(fs.readFileSync(file, 'utf8'), {
        file: file
      });
    }

    return SCADParser.cache[file];
  }
};


try {
  const ast = SCADParser.getAST('../../example/ex2.scad');
  inspect(ast);
} catch (error) {
  inspect(error);
}