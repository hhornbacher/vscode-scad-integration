const { workspace, languages } = require('vscode'),
    _ = require('lodash'),
    SCADProcessor = require('./scad-processor');


// Activate extension features
function activate(context) {
    const scadProcessor = new SCADProcessor();
    let featureDisposables = [
        languages.registerDefinitionProvider('scad', scadProcessor),
        languages.registerReferenceProvider('scad', scadProcessor),
        languages.registerRenameProvider('scad', scadProcessor),
        //workspace.registerTextDocumentContentProvider()
    ];

    _.each(featureDisposables, disposable => context.subscriptions.push(disposable));
}

// Cleanup when getting deactivated
function deactivate() {
}

module.exports = { activate, deactivate };