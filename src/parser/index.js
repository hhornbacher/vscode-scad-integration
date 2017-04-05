const _ = require('lodash'),
  fs = require('fs'),
  pegParser = require('./peg/scad-peg-parser');

require('./ast')(() => ({}), '../../example/ex3.scad');

const SCADParser = module.exports = {
  cache: [],
  codeCache: [],
  getAST: (file = null, code = null, useCache = true) => {
    if (useCache && SCADParser.cache[file])
      return SCADParser.cache[file];

    if (!_.isString(file) && !_.isString(code))
      throw new Error('You have to pass either code or file parameter!');

    if (code) {
      try {
        if (useCache) {
          SCADParser.codeCache[file] = code;
          SCADParser.cache[file] = pegParser.parse(code, {
            file: file
          });
        }
        else {
          SCADParser.codeCache[file] = code;
          pegParser.parse(code, {
            file: file
          });
        }
      } catch (error) {
        console.log(error.message, '\n', error.location);
      }
    }
    else {
      let code = fs.readFileSync(file, 'utf8');
      if (useCache) {
        SCADParser.codeCache[file] = code;
        SCADParser.cache[file] = pegParser.parse(code, {
          file: file
        });
      }
      else {
        return pegParser.parse(code, {
          file: file
        });
      }
    }

    return SCADParser.cache[file];
  },
  getCodeExcerpt: (file, location, offset = 6) => {
    let lines = SCADParser.codeCache[file].split('\n');
    let output = '[...]\n';
    let start = location.start.line - (1 + offset);
    let end = location.end.line + offset - 1;
    for (let i = start; i < end; i++) {
      if (i !== (location.start.line - 1))
        output += `${_.padStart((i + 1), 4, '0')}: ${lines[i]}\n`;
      else {
        output += `${_.padStart((i + 1), 4, '0')}: ${lines[i]}\n#`;
        _.times(location.start.column - 1 + 6, () => { output += ' ' });
        output += '^';
        _.times((location.end.column - location.start.column) - 1, () => { output += '~' });
        output += '\n';
        
      }
    }
    return output + '[...]';
  }
};


try {
  const ast = SCADParser.getAST('../../example/ex3.scad');
  console.log(ast);
} catch (error) {
  if (error.location)
    console.log(`${error.message}\n${SCADParser.getCodeExcerpt('../../example/ex3.scad', error.location)}`, error.location);
  else
    console.log(error);
}