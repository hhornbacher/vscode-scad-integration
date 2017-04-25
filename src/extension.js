const { languages } = require('vscode'),
    _ = require('lodash'),
    SCADProcessor = require('./scad-processor'),
    scadDefinitionProvider = require('./scad-definition-provider');

const scadProcessor = new SCADProcessor();

// Activate extension features
function activate(context) {
    let featureDisposables = [
        languages.registerDefinitionProvider('scad', new scadDefinitionProvider(scadProcessor))
    ];

    _.each(featureDisposables, disposable => context.subscriptions.push(disposable));
}

// Cleanup when getting deactivated
function deactivate() {
}

module.exports = { activate, deactivate };