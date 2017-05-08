const Promise = require('bluebird'),
    _ = require('lodash'),
    tmp = Promise.promisifyAll(require('tmp')),
    path = require('path'),
    inflection = require('inflection'),
    fs = Promise.promisifyAll(require('fs')),
    Mustache = require('mustache'),
    { workspace, window, commands, Position, Selection, Uri } = require('vscode');

class SCADTemplateProcessor {
    constructor(scadProcessor) {
        this.templates = {
            files: {
                main: fs.readFileSync(path.resolve(__dirname, '../templates/files/main.mustache'), 'utf8'),
                component: fs.readFileSync(path.resolve(__dirname, '../templates/files/component.mustache'), 'utf8')
            },
            views: {
                filePreview: fs.readFileSync(path.resolve(__dirname, '../templates/views/preview.mustache'), 'utf8')
            }
        };
        this.scadProcessor = scadProcessor;

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

    cmdRenderPreview(uri) {
        let filePath = uri.fsPath;
        this.scadProcessor.render(filePath)
            .then(previewImage =>
                Promise.props(
                    {
                        content: Mustache.render(this.templates.views.filePreview, {
                            previewImage: previewImage
                        }),
                        tmpFile: tmp.fileAsync({ postfix: '.html' })
                            .then((tmpFile) => fs.writeFileAsync(tmpFile)
                                .then(() => tmpFile)
                            )
                    }
                )
                    .then(({ content, tmpFile }) =>
                        fs.writeFileAsync(tmpFile, content, 'utf8')
                            .then(() => tmpFile)
                    )
            )
            .then(tmpFile => commands.executeCommand('vscode.previewHtml', Uri.parse('file://'+tmpFile)))
        /*.then(content => tmp.fileAsync({ postfix: '.html' })
            .then((tmpFile) => fs.writeFileAsync(tmpFile)
                .then(() => tmpFile)
            ));*/
        return true;
    }

    cmdCreateMainFile(uri) {
        const self = this;
        if (uri && uri.scheme === 'file')
            uri = uri.fsPath + '/main.scad';


        window.showInputBox({
            prompt: 'Paramters for the new Main module'
        })
            .then(params => {
                self.createFile(this.templates.main, {
                    params: _.map(params.split(','), param => param.trim()).join(',\n    ')
                }, uri || null)
            })

        return true;
    }

    cmdCreateComponentFile(uri) {
        const self = this;
        if (uri && uri.scheme === 'file')
            uri = uri.fsPath + '/main.scad';

        Promise.join([
            window.showInputBox({
                prompt: 'Name of your new component'
            }),
            window.showInputBox({
                prompt: 'Paramters for component'
            })
        ], (component, params) => {
            uri += '/' + inflection.transform(component, ['underscore', 'dasherize']);
            self.createFile(this.templates.main, {
                component: inflection.classify(component),
                params: _.map(params.split(','), param => param.trim()).join(',\n    ')
            }, uri || null);
        });

        return true;
    }
}

module.exports = SCADTemplateProcessor;