const _ = require('lodash');

module.exports = function Errors(file, registerClass) {

    class SCADSyntaxError extends SyntaxError {
        constructor(tracer, {message, expected, found, location}) {
            super(message);

            this._expected = expected;
            this._found = found;
            this._location = new Location(location);
            this._trace = tracer.getTrace();

            console.log(this);
        }
    }
    registerClass(SCADSyntaxError);

    // class SCADTypeError extends TypeError {
    //     constructor(message, entity) {
    //         super(message);
    //         this.location = new Location();
    //         this.entity = entity;
    //         this.file = file;
    //     }
    // }
    // registerClass(SCADTypeError);

    // class SCADSyntaxError extends SyntaxError {
    //     constructor(message, entity) {
    //         super(message);
    //         this.location = new Location();
    //         this.entity = entity;
    //         this.file = file;
    //     }
    // }
    // registerClass(SCADSyntaxError);
};
