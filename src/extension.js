const { window, commands, languages } = require('vscode'),
    _ = require('lodash'),
    scadDefinitionProvider = require('./scad-definition-provider');

// Activate extension features
function activate(context) {
    console.log('Extension "openscad-integration" is now activated!');

    let featureDisposables = [
        languages.registerDefinitionProvider('scad', new scadDefinitionProvider())
    ];

    _.each(featureDisposables, disposable => context.subscriptions.push(disposable));
}

// Cleanup when getting deactivated
function deactivate() {
}

module.exports = { activate, deactivate };