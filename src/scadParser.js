const _ = require('lodash'),
  fs = require('fs'),
  pegParser = require('./scadPEGParser');

const runningAsScript = !module.parent;

const SCADParser = module.exports = {
  cache: [],
  xxx: 'ABC',
  getAST: (file, code = null) => {
    console.log('getAST');
    if (SCADParser.cache[file])
      return SCADParser.cache[file];
    console.log('not cached!');

    if (code) {
      console.log('code supplied: ', code);
      try {
        SCADParser.cache[file] = pegParser.parse(code);
        console.log('parsed: ', SCADParser.cache[file]);
      } catch (error) {
        console.log(error, '\n', error.location);
      }
    }
    else {
      console.log('read from file: ', file);
      SCADParser.cache[file] = pegParser.parse(fs.readFileSync(file, 'utf8'));
    }

    return SCADParser.cache[file];
  }
};

if (runningAsScript) {
  try {
    const ast = SCADParser.getAST('../example/ex2.scad');
    console.log(ast);

    const variables = ast.findNodeByType('Variable');
    console.log(_.find(variables, v => v.name === 'XXX'));
  } catch (error) {
    console.log(error);
  }

}