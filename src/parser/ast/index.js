const _ = require('lodash'),
    inspect = require('util').inspect;



/**
 * Register all classes globally
 * @param location {Function} Function, that returns the current Location in the code
 * @param {String|null} file Path of the current file
 * @param {String|null} code Code to parse
 */
const ast = (location = () => ({}), file, code) => {
    Array.prototype.trim = function () {
        return _.filter(this, obj => !_.isNull(obj));
    }

    Array.prototype.toString = function () {
        return this.join('');
    }

    /**
     * Register a class as global
     * @param {Class} cl The class to register 
     * @param {String} name Optional: To set the class name manually
     */
    const registerClass = function (cl, name) {
        global[name || cl.name] = cl;
    };

    /**
     * Get a code excerpt based on the provided location
     * @param {String} file File path
     * @param {Location} location Location of the code of interest
     * @param {Number} offset Count of lines to display before and after the code location
     * @returns {String} String with resulting code excerpt
     */
    const getCodeExcerpt = (location, offset = 6) => {
        let lines = code.split('\n');
        let output = `Code excerpt: ${file}\n[...]\n`;
        let start = location._start.line - (1 + offset);
        let end = location._end.line + offset - 1;
        for (let i = start; i < end; i++) {
            if (i !== (location._start.line - 1))
                output += `${_.padStart((i + 1), 4, '0')}: ${lines[i]}\n`;
            else {
                output += `${_.padStart((i + 1), 4, '0')}: ${lines[i]}\n#`;
                _.times(location._start.column - 1 + 6, () => { output += ' ' });
                output += '^';
                _.times((location._end.column - location._start.column) - 1, () => { output += '~' });
                output += '\n';
            }
        }
        return output + '[...]';
    };

    /**
     * Detailed inspection of an Object
     * @param {Object} obj Object to inspect
     * @param {Boolean} showHidden Show non-enumberable properties
     * @param {Number} depth Defines how deep to inspect the object of interest
     * @returns {String} String with inspection result
     */
    const inspectObject = (obj, showHidden = true, depth = 5) => inspect(obj, showHidden, depth, true);

    // Register inspectObject as global
    global.inspectObject = inspectObject;
    // Register inspectObject as global
    global.getCodeExcerpt = getCodeExcerpt;
    // Register lodash as global
    registerClass(_, '_');

    /**
     * Base class for all AST related classes
     */
    class ASTBaseClass {
        constructor(privateProperties) {
            Object.defineProperty(this, '__', {
                enumerable: false,
                writable: true,
                value: {}
            })
            _.each(privateProperties, (value, key) => {
                let readOnly = /^_.*/.test(key);

                if (readOnly) {
                    key = key.replace('_', '');
                }

                this.__[key] = value;

                let options = {
                    enumerable: true,
                    get: () => {
                        return this.__[key];
                    }
                };

                if (!readOnly)
                    options.set = (val) => {
                        this.__[key] = val;
                    };

                Object.defineProperty(this, key, options);
            })
        }

        toString() {
            return inspectObject(this);
        }
    }
    registerClass(ASTBaseClass);

    /*    class CodeFile {
            constructor(file, content = null) {
                if (content === null)
                    content = fs.readFileSync(file, 'utf8');
    
                this._content;
                this._lines = content.split('\n');
            }
    
            get length() {
                return this._content.length;
            }
    
            get lineCount() {
                return this._lines.length;
            }
    
            get lines() {
                return this._lines;
            }
        }
        registerClass(CodeFile);
    */

    class Location extends ASTBaseClass {
        constructor({ start, end } = location()) {
            super({
                _start: start,
                _end: end
            });
        }
    }
    registerClass(Location);


    class Trace extends ASTBaseClass {
        constructor({ type, rule, location }) {
            super({
                _type: type.replace('rule.', ''),
                _rule: rule,
                _location: new Location(location)
            });
        }
    }
    registerClass(Trace);

    class SCADTracer extends ASTBaseClass {
        constructor() {
            super({
                stackTrace: []
            });
        }

        trace(current) {
            this.stackTrace.push(new Trace(current));
        }
    }
    registerClass(SCADTracer);

    // Register error classes as global
    require('./errors')(registerClass);

    // Register node classes as global, if file is set
    if (_.isString(file))
        require('./nodes')(file, registerClass);
};

module.exports = ast;