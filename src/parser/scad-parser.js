const _ = require('lodash'),
  fs = require('fs'),
  pegParser = require('./scad-peg-parser');
 
const SCADParser = module.exports = {
  cache: [],
  getAST: (file, code = null) => {
    if (SCADParser.cache[file])
      return SCADParser.cache[file];

    if (code) {
      try {
        SCADParser.cache[file] = pegParser.parse(code);
      } catch (error) {
        console.log(error, '\n', error.location);
      }
    }
    else {
      SCADParser.cache[file] = pegParser.parse(fs.readFileSync(file, 'utf8'));
    }

    return SCADParser.cache[file];
  }
};


  try {
    const ast = SCADParser.getAST('../../example/ex2.scad');
    console.log(_.find(ast.findNodeByType('Variable'), {name:'row'}).data.data[0].children);

  } catch (error) {
    console.log(error);
  }