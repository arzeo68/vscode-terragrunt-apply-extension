import * as vscode from 'vscode';
import { resolveTargetDir, isDirectoryType } from './resolveTargetDir';
import { TERRAGRUNT_COMMANDS } from './terragruntCommands';

async function runTerragrunt(
  terminalInput: string,
  uri?: vscode.Uri
): Promise<void> {
  if (!uri) {
    vscode.window.showWarningMessage(
      'Right-click a file or folder to use Terragrunt.'
    );
    return;
  }

  let isDirectory: boolean;
  try {
    const stat = await vscode.workspace.fs.stat(uri);
    isDirectory = isDirectoryType(stat.type, vscode.FileType.Directory);
  } catch {
    vscode.window.showErrorMessage(`Terragrunt: cannot access ${uri.fsPath}`);
    return;
  }

  const dir = resolveTargetDir(uri.fsPath, isDirectory);
  const terminal = vscode.window.createTerminal({ name: 'Terragrunt', cwd: dir });
  terminal.show();
  terminal.sendText(terminalInput);
}

export function activate(context: vscode.ExtensionContext): void {
  for (const { id, terminalInput } of TERRAGRUNT_COMMANDS) {
    context.subscriptions.push(
      vscode.commands.registerCommand(id, (uri?: vscode.Uri) =>
        runTerragrunt(terminalInput, uri)
      )
    );
  }
}

export function deactivate(): void {}
