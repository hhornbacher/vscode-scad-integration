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

    createFile(template, parameters, file = null) {
        const content = Mustache.render(template, parameters);
        const { cleanContent, cursorMark } = this.extractCursorMark(content);

        let uri = {
            content: cleanContent,
            language: 'scad'
        };
        if (file) {
            const filePath = path.dirname(file);

            return fs.openAsync(file, 'wx')
                .then(handle => {
                    return fs.writeAsync(handle, cleanContent, 'utf8')
                        .then(() => file)
                        .then((file) => workspace.openTextDocument(file))
                        .then(doc => window.showTextDocument(doc))
                        .then(editor => this.setCursorPosition(editor, cursorMark));
                })
                .catch(() => {
                    return window.showWarningMessage('File exists! Do you want to overwrite it?', 'Yes', 'Change name')
                        .then(result => {
                            if (result === 'Yes') {
                                return fs.writeFileAsync(file, cleanContent, 'utf8')
                                    .then(() => file);
                            }
                            else if (result === 'Change name') {
                                return window.showInputBox({
                                    prompt: 'Please enter a new name:',
                                    value: path.basename(file.replace('.scad', '_.scad'))
                                })
                                    .then(file => {
                                        fs.writeFileAsync(filePath + '/' + file, cleanContent, 'utf8');
                                        return filePath + '/' + file;
                                    });
                            }
                        })
                        .then((file) => workspace.openTextDocument(file))
                        .then(doc => window.showTextDocument(doc))
                        .then(editor => this.setCursorPosition(editor, cursorMark));
                });
        }
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
                    params: _.map(params.split(','), param => param.trim()).join(',\n    ')
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
                params: _.map(params.split(','), param => param.trim()).join(',\n    ')
            }, path || null);
        });

        return true;
    }
}

module.exports = SCADTemplateProcessor;