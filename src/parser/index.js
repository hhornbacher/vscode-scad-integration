const _ = require('lodash'),
  fs = require('fs'),
  pegParser = require('./peg/scad-peg-parser');

require('./ast')(() => ({}), '../../example/ex4.scad', '');


const tracer = new SCADTracer();
let cache = [],
  codeCache = [];

const loadCode = (file, code, useCache) => {
  try {
    if (useCache) {
      codeCache[file] = code;
      cache[file] = pegParser.parse(code, {
        tracer, file
      });
    }
    else {
      codeCache[file] = code;
      pegParser.parse(code, {
        tracer, file
      });
    }
  } catch (error) {
    if (error.name === 'SyntaxError')
      error = new SCADSyntaxError(file, tracer, error);
    throw error;
  }
};

const loadFile = (file, useCache) => {
  try {
    let code = fs.readFileSync(file, 'utf8');
    if (useCache) {
      codeCache[file] = code;
      cache[file] = pegParser.parse(code, {
        tracer, file
      });
    }
    else {
      return pegParser.parse(code, {
        tracer, file
      });
    }
  } catch (error) {
    if (error.name === 'SyntaxError')
      error = new SCADSyntaxError(file, tracer, error);
    throw error;
  }
};

const SCADParser = module.exports = {
  getAST: (file = null, code = null, useCache = true) => {
    if (useCache && cache[file])
      return cache[file];

    if (!_.isString(file) && !_.isString(code))
      throw new Error('You have to pass either code or file parameter!');

    if (code)
      loadCode(file, code, useCache);
    else
      loadFile(file, useCache);

    return cache[file];
  }
};

try {
  const ast = SCADParser.getAST('../../example/ex4.scad');
  console.log(inspectObject(ast, false));
  console.log(inspectObject(ast.location, false));
  console.log(inspectObject(ast.parent, false));
  console.log(inspectObject(ast.root, false));
  console.log(inspectObject(ast.file, false));
  console.log(inspectObject(ast.children, false));
} catch (error) {
  console.log(error.toString());
}