// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window } = require('vscode');


class scadDefinitionProvider {

    constructor(scadProcessor) {
        this.scadProcessor = scadProcessor;
        console.log('SCAD Language Definition Provider loaded.');
    }

    provideDefinition(document, position) {
        let node = null;
        try {
            this.scadProcessor.parse(document);
            node = this.scadProcessor.getNode(document, position);
        } catch (error) {
            console.log(error);
        }

        if (node)
            window.showInformationMessage(node.toString());
        //console.log(this.getEntity(ast, document, position));

        // Display a message box to the user
        return null;
    }
}

module.exports = scadDefinitionProvider;