import * as vscode from 'vscode';
import { resolveTargetDir, isDirectoryType } from './resolveTargetDir';

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    'terragruntApply.applyHere',
    async (uri?: vscode.Uri) => {
      if (!uri) {
        vscode.window.showWarningMessage(
          'Right-click a file or folder to use Terragrunt Apply.'
        );
        return;
      }

      let isDirectory: boolean;
      try {
        const stat = await vscode.workspace.fs.stat(uri);
        isDirectory = isDirectoryType(stat.type, vscode.FileType.Directory);
      } catch {
        vscode.window.showErrorMessage(
          `Terragrunt Apply: cannot access ${uri.fsPath}`
        );
        return;
      }

      const dir = resolveTargetDir(uri.fsPath, isDirectory);
      const terminal = vscode.window.createTerminal({
        name: 'Terragrunt apply',
        cwd: dir,
      });
      terminal.show();
      terminal.sendText('terragrunt apply');
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate(): void {}
