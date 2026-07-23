/**
 * The terragrunt apply variants exposed in the explorer "Terragrunt" submenu.
 * `id` is the vscode command id (must match `contributes.commands` in
 * package.json); `terminalInput` is the exact line sent to the terminal.
 */
export interface TerragruntCommand {
  id: string;
  terminalInput: string;
}

export const TERRAGRUNT_COMMANDS: TerragruntCommand[] = [
  { id: 'terragruntApply.apply', terminalInput: 'terragrunt apply' },
  {
    id: 'terragruntApply.applySourceUpdate',
    terminalInput: 'terragrunt apply --source-update',
  },
  {
    id: 'terragruntApply.applyAutoApprove',
    terminalInput: 'terragrunt apply --auto-approve',
  },
];
