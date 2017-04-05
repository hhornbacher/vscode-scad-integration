// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window } = require('vscode'),
    SCADParser = require('./parser');

class scadDefinitionProvider {

    constructor() {
        console.log('SCAD Language Definition Provider loaded.');
    }

    getEntity(ast, document, position) {
        return 'XXX';
    }

    provideDefinition(document, position) {
        const ast = SCADParser.getAST(document.fileName, document.getText());
        /*window.showInformationMessage('definition');*/
        //console.log(this.getEntity(ast, document, position));

        // Display a message box to the user
        return null;
    }
}

module.exports = scadDefinitionProvider;