import * as _ from 'lodash';
import fs from 'fs-then-native';
import * as _fs from 'fs';
import * as path from 'path';
import inflection from 'inflection';
import Mustache from 'mustache';
import { workspace, window, commands, Position, Selection, Uri } from 'vscode';
import SCADProcessor from './scad-processor';
import tmpFile from './tmp';


type TemplateEntry = { [key: string]: string };

class SCADTemplateProcessor {
    private templates: {
        [key: string]: TemplateEntry
    };
    private scadProcessor: SCADProcessor;
    constructor(scadProcessor: SCADProcessor) {
        this.templates = {
            files: {
                main: _fs.readFileSync(path.resolve(__dirname, '../templates/files/main.mustache'), 'utf8'),
                component: _fs.readFileSync(path.resolve(__dirname, '../templates/files/component.mustache'), 'utf8')
            },
            views: {
                filePreview: _fs.readFileSync(path.resolve(__dirname, '../templates/views/preview.mustache'), 'utf8')
            }
        };
        this.scadProcessor = scadProcessor;

    }

    extractCursorMark(content: string) {
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

            return fs.open(file, 'wx')
                .then(handle => {
                    return fs.write(handle, cleanContent, 'utf8')
                        .then(() => file)
                        .then((file) => workspace.openTextDocument(file))
                        .then(doc => window.showTextDocument(doc))
                        .then(editor => this.setCursorPosition(editor, cursorMark));
                })
                .catch(() => {
                    return window.showWarningMessage('File exists! Do you want to overwrite it?', 'Yes', 'Change name')
                        .then(result => {
                            if (result === 'Yes') {
                                return fs.writeFile(file, cleanContent, 'utf8')
                                    .then(() => file);
                            }
                            else if (result === 'Change name') {
                                return window.showInputBox({
                                    prompt: 'Please enter a new name:',
                                    value: path.basename(file.replace('.scad', '_.scad'))
                                })
                                    .then(file => {
                                        fs.writeFile(filePath + '/' + file, cleanContent, 'utf8');
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
/*        let filePath = uri.fsPath;
        this.scadProcessor.render(filePath)
            .then(previewImage =>
                Promise.props(
                    {
                        content: Mustache.render(this.templates.views.filePreview, {
                            previewImage: previewImage
                        }),
                        tmpFile: tmp.fileAsync({ postfix: '.html' })
                            .then((tmpFile) => fs.writeFile(tmpFile)
                                .then(() => tmpFile)
                            )
                    }
                )
                    .then(({ content, tmpFile }) =>
                        fs.writeFile(tmpFile, content, 'utf8')
                            .then(() => tmpFile)
                    )
            )
            .then(tmpFile => commands.executeCommand('vscode.previewHtml', Uri.parse('file://' + tmpFile)))*/
        /*.then(content => tmp.fileAsync({ postfix: '.html' })
            .then((tmpFile) => fs.writeFile(tmpFile)
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

/*        Promise.join([
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
        });*/

        return true;
    }
}

export default SCADTemplateProcessor;