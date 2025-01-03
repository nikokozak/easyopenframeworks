// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');

// The following will get the path to the OF installation from the workspace settings:
const config = vscode.workspace.getConfiguration('easyopenframeworks');
const ofPath = config.get('ofPath');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
class OFInfoProvider {
	static viewType = 'easyopenframeworks.ofInfo';
	
	constructor(extensionUri) {
		this._extensionUri = extensionUri;
		this._view = undefined;
	}

	resolveWebviewView(webviewView) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true
		};

		const config = vscode.workspace.getConfiguration('easyopenframeworks');
		const ofPath = config.get('ofPath');

		webviewView.webview.html = `
			<!DOCTYPE html>
			<html>
				<head>
					<style>
						body { 
							padding: 20px;
							height: 100vh;
							box-sizing: border-box;
						}
						.info-section {
							margin-bottom: 20px;
						}
						.section-title {
							font-size: 14px;
							font-weight: bold;
							margin-bottom: 10px;
						}
					</style>
				</head>
				<body>
					<div class="info-section">
						<div class="section-title">Installation</div>
						<div>${ofPath || 'OpenFrameworks is not installed'}</div>
					</div>
				</body>
			</html>
		`;
	}
}

function activate(context) {
	// Register the webview
	const provider = new OFInfoProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(OFInfoProvider.viewType, provider)
	);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "easyopenframeworks" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('easyopenframeworks.installOF', async () => {
		if (ofPath) {
			const choice = await vscode.window.showInformationMessage(
				`OF Installation found at ${ofPath}. Do you want to create a new install?`,
				"Yes",
				"No"
			);
			if (choice === "No") {
				return;
			}
		}

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
				throw new Error('Installation path cannot contain spaces in path string. Please choose a different location.');
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

				const pGenPath = path.join(targetPath, 'openFrameworks', 'apps', 'projectGenerator');

				// Download Project Generator
				progress.report({ message: 'Downloading Project Generator...' });
				await new Promise((resolve, reject) => {
					exec('git clone https://github.com/openframeworks/projectGenerator.git', { cwd: pGenPath }, (error) => {
						if (error) reject(error);
						else resolve();
					});
				});

				// Build Project Generator
				progress.report({ message: 'Building Project Generator...' });
				await new Promise((resolve, reject) => {
					exec('cd commandLine && make -j', { cwd: pGenPath }, (error) => {
						if (error) reject(error);
						else resolve();
					});
				});
			});

			// Save OF path to workspace settings
			// TODO: config is declared in global scope.
			// const config = vscode.workspace.getConfiguration('easyopenframeworks');
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
