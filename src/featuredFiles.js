const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const getAllFiles = function (dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
        const absolute = path.join(dirPath, file)
        if (fs.statSync(absolute).isDirectory()) {
            arrayOfFiles = getAllFiles(absolute, arrayOfFiles)
        } else {
            arrayOfFiles.push(absolute)
        }
    })

    return arrayOfFiles
}

module.exports = class FeaturedfilesProvider {

    workspaceRoot = null
    _onDidChangeTreeData = new vscode.EventEmitter();
    feature = null
    oldFeature = null
    items = []
    onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot
    }

    refresh(feature) {
        console.log("Updating feature =>", feature)
        this.feature = feature
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No dependency in empty workspace');
            return Promise.resolve([]);
        }

        if(this.feature === this.oldFeature) return this.items

        console.log("Loading files with new feature = ", this.feature)

        if (this.feature === null) return Promise.resolve([]);

        this.items = this.getfilesByFeature(this.feature)
        this.oldFeature = this.feature
        return  this.items
    }



    async getfilesByFeature(feature) {
        const featureIdentifier = `@feature=${feature}`

        const files = getAllFiles(this.workspaceRoot)
        const toBeLoad = files.filter(file => {
            // console.log("Reading => ", file)
            const contents = fs.readFileSync(file, 'utf-8');
            return contents.includes(featureIdentifier);
        })

        let items = []
        for (let i = 0; i < toBeLoad.length; i++) {
            items.push(this.generateItem(toBeLoad[i]))
        }

        // console.log("Items to be load => ", toBeLoad)

        return items
    }


    generateItem(completePath) {
        const item = new vscode.TreeItem(path.parse(completePath).base)
        let uri = vscode.Uri.file(completePath);

        item.iconPath = new vscode.ThemeIcon('circle-outline')

        item.command = {
            title: "Open file",
            command: "vscode.open",
            arguments: [uri]
        }
        return item
    }



}
