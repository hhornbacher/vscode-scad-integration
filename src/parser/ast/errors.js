const _ = require('lodash');

module.exports = function Errors(registerClass) {

    class SCADSyntaxError extends Error {
        constructor(file, tracer, {message, expected, found, location}) {
            super(message);

            _.extend(this, new ASTBaseClass({
                expected,
                found,
                location: new Location(location),
                trace: _.slice(tracer.stackTrace, tracer.stackTrace.length-10),
                file
            }));
        }

        toString() {
            console.log(_.findLastIndex({type}));
            return `SCAD syntax error: ${this.message} [${this.file}@${this.location.start.line}:${this.location.start.column}]\n${this.trace}`;
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
