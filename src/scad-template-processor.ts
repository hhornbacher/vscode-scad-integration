import { workspace, window, commands, Position, Selection, Uri } from 'vscode';
import * as _ from 'lodash';
import * as path from 'path';
import * as inflection from 'inflection';
import * as Mustache from 'mustache';
import SCADProcessor from './scad-processor';
import {tmpFile, readFile, writeFile, write, open} from './utils';

type TemplateMap = { [key: string]: { [key: string]: string } };

class SCADTemplateProcessor {
    private templates: TemplateMap | null;
    private scadProcessor: SCADProcessor;

    constructor(scadProcessor: SCADProcessor) {
        this.templates = null;
        Promise.all([
            readFile(path.resolve(__dirname, '../templates/files/main.mustache'), 'utf8'),
            readFile(path.resolve(__dirname, '../templates/files/component.mustache'), 'utf8'),
            readFile(path.resolve(__dirname, '../templates/views/preview.mustache'), 'utf8')
        ])
            .then(([main, component, filePreview]) => {
                this.templates = {
                    files: { main, component },
                    views: { filePreview }
                };
            })
            .catch(err => {
                console.log(err);
            });
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
        if (!this.templates)
            return null;

        const content = Mustache.render(template, parameters);
        const { cleanContent, cursorMark } = this.extractCursorMark(content);

        let uri = {
            content: cleanContent,
            language: 'scad'
        };
        if (file) {
            const filePath = path.dirname(file);

            return open(file, 'wx')
                .then(handle => {
                    return write(handle, cleanContent, 'utf8')
                        .then(() => file)
                        .then((file) => workspace.openTextDocument(file))
                        .then(doc => window.showTextDocument(doc))
                        .then(editor => this.setCursorPosition(editor, cursorMark));
                })
                .catch(() => {
                    return window.showWarningMessage('File exists! Do you want to overwrite it?', 'Yes', 'Change name')
                        .then(result => {
                            if (result === 'Yes') {
                                return writeFile(file, cleanContent, 'utf8')
                                    .then(() => file);
                            }
                            else if (result === 'Change name') {
                                return window.showInputBox({
                                    prompt: 'Please enter a new name:',
                                    value: path.basename(file.replace('.scad', '_.scad'))
                                })
                                    .then(file => {
                                        writeFile(filePath + '/' + file, cleanContent, 'utf8');
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
                Promise.all([
                    Mustache.render(this.templates.views.filePreview, {
                        previewImage: previewImage
                    }),
                    tmpFile({ postfix: '.html' })
                        .then((tmpFile) => writeFile(tmpFile)
                            .then(() => tmpFile)
                        )
                ])
                    .then(([content, tmpFile]) =>
                        writeFile(tmpFile, content, 'utf8')
                            .then(() => tmpFile)
                    )
            )
            .then(tmpFile => commands.executeCommand('vscode.previewHtml', Uri.parse('file://' + tmpFile)));
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

        Promise.all([
            window.showInputBox({
                prompt: 'Name of your new component'
            }),
            window.showInputBox({
                prompt: 'Paramters for component'
            })
        ]).then(([component, params]) => {
            uri += '/' + inflection.transform(component, ['underscore', 'dasherize']);
            self.createFile(this.templates.main, {
                component: inflection.classify(component),
                params: _.map(params.split(','), param => param.trim()).join(',\n    ')
            }, uri || null);
        });

        return true;
    }
}

export default SCADTemplateProcessor;