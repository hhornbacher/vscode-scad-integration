const _ = require('lodash'),
    SCADParser = require('scad-parser'),
    { Location, Position, Range, WorkspaceEdit } = require('vscode');

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

    tokenToRange(token) {
        return new Range(
            new Position(token.line - 1, token.col - 1),
            new Position(token.line - 1, token.col - 1 + token.size)
        );
    }

    getNode(document, position) {
        const token = this.parser.getToken(position.character, position.line + 1, document.fileName);
        return this.cache[document.fileName].ast.findByToken(token);
    }

    renameIdentifier(document, position, newText) {
        const token = this.parser.getToken(position.character, position.line + 1, document.fileName);
        const we = new WorkspaceEdit();
        if (token.type === 'identifier')
            _.each(this.parser.findTokens(token.value, null, document.fileName), token => {
                we.replace(document.uri, this.tokenToRange(token), newText);
            });
        if (token.type === 'actionCall' || token.type === 'moduleDefinition') {
            _.each(this.parser.findTokens(token.value, 'actionCall', document.fileName), token => {
                we.replace(document.uri, this.tokenToRange(token), newText + '(');
            });
            _.each(this.parser.findTokens(token.value, 'moduleDefinition', document.fileName), token => {
                we.replace(document.uri, this.tokenToRange(token), 'module ' + newText + '(');
            });
        }
        return we;
    }

    findReferences(document, position) {
        const token = this.parser.getToken(position.character, position.line + 1, document.fileName);
        if (_.includes(['identifier', 'actionCall', 'functionDefinition', 'moduleDefinition'], token.type)) {
            return _.map(this.parser.findTokens(token.value, null, document.fileName), token => new Location(document.uri, this.tokenToRange(token)));
        }
    }

    findDefinition(document, position) {
        const token = this.parser.getToken(position.character, position.line + 1, document.fileName);
        if (token.type === 'identifier') {
            console.log(token);
            console.log(this.cache[document.fileName].ast.findByToken(token));
            let v = _.filter(
                this.cache[document.fileName].ast.findByName(token.value),
                node => node.className === 'VariableNode'
            )[0];
            const range = new Range(
                new Position(v.tokens[0].line - 1, v.tokens[0].col - 1),
                new Position(v.tokens[2].line - 1, v.tokens[2].col - 1)
            );
            return new Location(document.uri, range);
        }
        else if (token.type === 'actionCall') {
            let m = _.filter(
                this.cache[document.fileName].ast.findByName(token.value),
                node => node.className === 'ModuleNode'
            )[0];
            const range = new Range(
                new Position(m.tokens[0].line - 1, m.tokens[0].col - 1),
                new Position(m.tokens[3].line - 1, m.tokens[3].col - 1)
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

    provideReferences(document, position) {
        let locations = null;
        try {
            this.parse(document);
            locations = this.findReferences(document, position);
        } catch (error) {
            console.log(error);
        }
        console.log(locations);
        return locations;
    }

    provideRenameEdits(document, position, newName) {
        let edit = null;
        try {
            this.parse(document);
            edit = this.renameIdentifier(document, position, newName);
        } catch (error) {
            console.log(error);
        }

        return edit;
    }
}

module.exports = SCADProcessor;