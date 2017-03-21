const _ = require('lodash');

module.exports = function Errors(file, registerClass) {

    class SCADTypeError extends TypeError {
        constructor(message, entity) {
            super(message);
            this.location = new Location();
            this.entity = entity;
            this.file = file;
        }
    }
    registerClass(SCADTypeError);

    class SCADSyntaxError extends SyntaxError {
        constructor(message, entity) {
            super(message);
            this.location = new Location();
            this.entity = entity;
            this.file = file;
        }
    }
    registerClass(SCADSyntaxError);
};
