const _ = require('lodash');

module.exports = function Errors(location, file, registerClass) {

    class SCADTypeError extends TypeError {
        constructor(message, entity) {
            super(message);
            this.entity = entity;
            this.file = file;
        }
    }
    registerClass(SCADTypeError);

    class SCADSyntaxError extends SyntaxError {
        constructor(message, entity, stack = null) {
            super(message);
            this.entity = entity;
            this.file = file;
        }
    }
    registerClass(SCADSyntaxError);
};
