'use strict';

import { languages, commands, Disposable, ExtensionContext } from 'vscode';
import SCADProcessor from './scad-processor';
import SCADTemplateProcessor from './scad-template-processor';


export function activate(context: ExtensionContext) {
    const scadProcessor = new SCADProcessor();
    const templateProcessor = new SCADTemplateProcessor(scadProcessor);

    const providerRegistrations = Disposable.from(
        languages.registerDefinitionProvider('scad', scadProcessor),
        languages.registerReferenceProvider('scad', scadProcessor),
        languages.registerRenameProvider('scad', scadProcessor),
        languages.registerDocumentFormattingEditProvider('scad', scadProcessor)
    );

    const commandsRegistrations = Disposable.from(
        commands.registerCommand('scad.createMainFile', templateProcessor.cmdCreateMainFile, templateProcessor),
        commands.registerCommand('scad.createComponentFile', templateProcessor.cmdCreateComponentFile, templateProcessor),
        commands.registerCommand('scad.renderPreview', templateProcessor.cmdRenderPreview, templateProcessor)
    );

    context.subscriptions.push(
        commandsRegistrations,
        providerRegistrations
    );
}


export function deactivate() {
}