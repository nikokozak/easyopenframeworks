// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

// The following will get the path to the OF installation from the workspace settings:
// const config = vscode.workspace.getConfiguration('easyopenframeworks');
// const ofPath = config.get('ofPath');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "easyopenframeworks" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('easyopenframeworks.installOF', async () => {
		try {
			// Get folder to install OF
			const folder = await vscode.window.showOpenDialog({
				canSelectFiles: false,
				canSelectFolders: true,
				canSelectMany: false,
				title: 'Select folder to install OpenFrameworks'
			});

			if (!folder) return;

			const targetPath = folder[0].fsPath;
			
			// Check for spaces in path
			if (targetPath.includes(' ')) {
				throw new Error('Installation path cannot contain spaces. Please choose a different location.');
			}

			// Show progress
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Installing OpenFrameworks",
				cancellable: false
			}, async (progress) => {
				// Clone repo
				progress.report({ message: 'Cloning repository...' });
				await new Promise((resolve, reject) => {
					exec(
						'git clone --recursive git@github.com:openframeworks/openFrameworks.git --depth 1',
						{ cwd: targetPath },
						(error) => {
							if (error) reject(error);
							else resolve();
						}
					);
				});

				// Download dependencies
				progress.report({ message: 'Downloading OF dependencies...' });
				await new Promise((resolve, reject) => {
					const scriptPath = path.join(targetPath, 'openFrameworks', 'scripts', 'osx', 'download_libs.sh');
					exec(
						`chmod +x "${scriptPath}" && "${scriptPath}"`,
						{ cwd: path.dirname(scriptPath) },
						(error, _stdout, _stderr) => {
							if (error) reject(error);
							else resolve();
						}
					);
				});
			});

			// Save OF path to workspace settings
			const config = vscode.workspace.getConfiguration('easyopenframeworks');
			await config.update('ofPath', path.join(targetPath, 'openFrameworks'), vscode.ConfigurationTarget.Global);

			vscode.window.showInformationMessage('OpenFrameworks installed successfully!');
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to install OpenFrameworks: ${error.message}`);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
