const _ = require('lodash'),
    path = require('path'),
    Promise = require('bluebird'),
    inflection = require('inflection'),
    fs = Promise.promisifyAll(require('fs')),
    Mustache = require('mustache'),
    { workspace, window, Position, Selection } = require('vscode');

class SCADTemplateProcessor {
    constructor() {
        this.templates = {
            main: fs.readFileSync(path.resolve(__dirname, '../templates/main.mustache'), 'utf8'),
            component: fs.readFileSync(path.resolve(__dirname, '../templates/component.mustache'), 'utf8')
        };
    }

    extractCursorMark(content) {
        let out = {
            cleanContent: '',
            cursorMark: new Position(0, 0)
        };
        _.each(content.split('\n'), (text, line) => {
            let character = text.indexOf('%CUR%');
            if (character && /.*%CUR%.*/.test(text)) {
                out = {
                    cleanContent: content.replace('%CUR%', ''),
                    cursorMark: new Position(line, character)
                };
                return false;
            }
        });
        return out;
    }

    setCursorPosition(editor, cursorMark) {
        editor.selections = [new Selection(cursorMark, cursorMark)];
    }

    createFile(template, parameters, path = null) {
        const content = Mustache.render(template, parameters);
        const { cleanContent, cursorMark } = this.extractCursorMark(content);

        let uri = {
            content: cleanContent,
            language: 'scad'
        };
        if (path)
            return fs.existsAsync(path)
                .then(exists => {
                    if (!exists)
                        return fs.writeFileAsync(path, cleanContent, 'utf8');
                })
                .then(() => workspace.openTextDocument(path)
                    .then(doc => window.showTextDocument(doc))
                    .then(editor => this.setCursorPosition(editor, cursorMark)));

        else
            return workspace.openTextDocument(uri)
                .then(doc => window.showTextDocument(doc))
                .then(editor => this.setCursorPosition(editor, cursorMark));
    }

    cmdCreateMainFile(path) {
        const self = this;
        if (path && path.scheme === 'file')
            path = path.fsPath + '/main.scad';


        window.showInputBox({
            prompt: 'Paramters for the new Main module'
        })
            .then(params => {
                self.createFile(this.templates.main, {
                    params: _.map(params.split(','), param => param.trim()).join(',\n')
                }, path || null)
            })

        return true;
    }

    cmdCreateComponentFile(path) {
        const self = this;
        if (path && path.scheme === 'file')
            path = path.fsPath + '/main.scad';

        Promise.join([
            window.showInputBox({
                prompt: 'Name of your new component'
            }),
            window.showInputBox({
                prompt: 'Paramters for component'
            })
        ], (component, params) => {
            path += '/' + inflection.transform(component, ['underscore', 'dasherize']);
            self.createFile(this.templates.main, {
                component: inflection.classify(component),
                params: _.map(params.split(','), param => param.trim()).join(', ')
            }, path || null);
        });

        return true;
    }
}

module.exports = SCADTemplateProcessor;