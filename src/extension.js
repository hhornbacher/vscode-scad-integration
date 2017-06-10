const { languages, commands, Disposable } = require('vscode'),
    SCADProcessor = require('./scad-processor'),
    SCADTemplateProcessor = require('./scad-template-processor');

// Activate extension features
function activate(context) {
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

// Cleanup when getting deactivated
function deactivate() {
}

module.exports = { activate, deactivate };