import * as vscode from 'vscode';

import { spawnSync } from "child_process";
import { TextDecoder } from "util";

function haml2slim(html: string) {
	return sh("haml2slim", ["--ruby19-attributes"], html);
}

function sh(cmd: string, args: Array<string>, stdin: string): string | null {
	const r = spawnSync(cmd, args, { cwd: vscode.workspace.rootPath, input: Buffer.from(stdin), encoding: "buffer" });
	if (r.status !== 0) {
		const s = new TextDecoder().decode(r.stderr);
		vscode.window.showErrorMessage(s);
		return null;
	}

	return new TextDecoder().decode(r.stdout);
}

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.haml2slim', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor === undefined) { return; }

		const data = editor.document.getText();
		const haml = haml2slim(data);
		if (haml === null) { return; }

		editor.edit((edit) => {
			edit.replace(
				new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(data.length)),
				haml,
			);
			vscode.window.setStatusBarMessage("haml2slim done.", 2000);
		});

		vscode.languages.setTextDocumentLanguage(editor.document, "slim");
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
