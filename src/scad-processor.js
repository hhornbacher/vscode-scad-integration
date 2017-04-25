const _ = require('lodash'),
    SCADParser = require('scad-parser');

class SCADProcessor {
    constructor() {
        this.parser = new SCADParser();
        this.cache = {};
    }

    parse(document) {
        this.cache[document.fileName] = {
            lastParsed: new Date(),
            ast: this.parser.parseAST(document.fileName, document.getText())
        };
        return this.cache[document.fileName];
    }

    getNode(document, position) {
        const token = this.parser.getToken(position.character, position.line + 1, document.fileName);
        return this.cache[document.fileName].ast.findByToken(token);
    }

    findReferences(document, position) {
        
    }

    findDefinitions(document, position) {
        
    }
}

module.exports = SCADProcessor;