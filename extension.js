// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const FeaturedFilesProvider = require("./src/featuredFiles")
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const rootPath =
		vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
			? vscode.workspace.workspaceFolders[0].uri.fsPath
			: undefined;

	const provider = new FeaturedFilesProvider(rootPath)

	const reloadFiles = e => {
		console.log("Reloading...")
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			let document = editor.document;

			// Get the document text
			const documentText = document.getText();
			const doc = documentText.split("\n")
			let feature = null
			const featureIdentifier = `@feature=`
			doc.forEach(line => {
				const currentFeature = line.split(featureIdentifier)[1].trim()
				if (currentFeature !== "") {
					feature = currentFeature
				}
			})

			provider.refresh(feature)

		}
	}

	vscode.window.onDidChangeActiveTextEditor(reloadFiles)
	vscode.workspace.onDidSaveTextDocument(reloadFiles)


	vscode.window.registerTreeDataProvider('featureView', provider);
}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
