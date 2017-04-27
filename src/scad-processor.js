const _ = require('lodash'),
    SCADParser = require('scad-parser'),
    { window, Location, Position, Range } = require('vscode');

class SCADProcessor {
    constructor() {
        this.parser = new SCADParser();
        this.cache = {};
    }

    /* Internal */

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

    renameIdentifier(document, position, newName) {

    }

    findReferences(document, position) {
        const token = this.parser.getToken(position.character, position.line + 1, document.fileName);
        if (_.includes(['identifier', 'actionCall', 'functionDefinition', 'moduleDefinition'], token.type))
            console.log('References:', this.cache[document.fileName].ast.findByName(token.value));
    }

    findDefinition(document, position) {
        const token = this.parser.getToken(position.character, position.line + 1, document.fileName);
        if (token.type === 'identifier') {
            let v = _.filter(
                this.cache[document.fileName].ast.findByName(token.value),
                node => node.className === 'VariableNode'
            )[0];
            const range = new Range(
                new Position(v.tokens[0].line-1, v.tokens[0].col-1),
                new Position(v.tokens[2].line-1, v.tokens[2].col-1)
            );
            return new Location(document.uri, range);
        }
        else if (token.type === 'actionCall') {
            let m = _.filter(
                this.cache[document.fileName].ast.findByName(token.value),
                node => node.className === 'ModuleNode'
            )[0];
            const range = new Range(
                new Position(m.tokens[0].line-1, m.tokens[0].col-1),
                new Position(m.tokens[3].line-1, m.tokens[3].col-1)
            );
            return new Location(document.uri, range);
        }
    }

    /* vscode Providers */

    provideDefinition(document, position) {
        let location = null;
        try {
            this.parse(document);
            location = this.findDefinition(document, position);
        } catch (error) {
            console.log(error);
        }
        return location;
    }

    provideReferences(document, position, options) {
        let nodes = null;
        try {
            this.parse(document);
            nodes = this.findReferences(document, position);
        } catch (error) {
            console.log(error);
        }

        if (nodes)
            window.showInformationMessage(nodes.toString());

        return null;
    }

    provideRenameEdits(
        document, position,
        newName) {
        console.log(document, position, newName);

        try {
            this.parse(document);
            this.renameIdentifier(document, position, newName);
            window.showInformationMessage('Done');
        } catch (error) {
            console.log(error);
        }

        return null;
    }
}

module.exports = SCADProcessor;