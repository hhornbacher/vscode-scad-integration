const _ = require('lodash');
const _inspect = require('util').inspect;
global.inspect = (obj) => console.log(_inspect(obj, { showHidden: true, depth: null }));
require('../ast')(location, options.file);