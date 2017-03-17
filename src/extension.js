// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window, commands, languages } = require('vscode'),
    _ = require('lodash'),
    scadDefinitionProvider = require('./scadDefinitionProvider');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "openscad-integration" is now active!');

    console.log(context)

    let featureDisposables = [];

    featureDisposables += commands.registerCommand('extension.sayHello', function () {
        window.showInformationMessage('Hello World!');
    });

    featureDisposables += languages.registerDefinitionProvider('scad', new scadDefinitionProvider());

    _.each(featureDisposables, disposable => context.subscriptions.push(disposable));
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;