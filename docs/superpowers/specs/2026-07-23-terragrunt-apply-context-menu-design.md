# Terragrunt Apply Context Menu — Design

## Purpose

A VSCode extension that adds a right-click option in the file explorer to open a
terminal and run `terragrunt apply` at the selected location.

## Decisions

- **Target resolution:** Right-click a file → run in the file's parent directory.
  Right-click a folder → run in that folder. (Terragrunt operates on a directory
  containing `terragrunt.hcl`, never on a single file.)
- **Apply mode:** Interactive. Run plain `terragrunt apply`; the user confirms
  yes/no in the terminal. No `-auto-approve`.
- **Menu visibility:** Show the item on all folders, and on files with extension
  `.hcl` or `.tf` only.
- **Terminal handling:** Open a fresh terminal for each run so parallel applies
  stay separate.

## Approach

Plain TypeScript extension compiled with `tsc`. No bundler — the extension is
small (two source files). VSCode extensions are idiomatically TypeScript.

## Architecture

### Manifest — `package.json`

- `contributes.commands`: one command
  - id `terragruntApply.applyHere`
  - title `Terragrunt Apply Here`
- `contributes.menus` → `explorer/context`: reference the command
  - `group`: `navigation@99`
  - `when`: `explorerResourceIsFolder || resourceExtname == .hcl || resourceExtname == .tf`
- `engines.vscode`: current stable engine range
- `main`: `./out/extension.js`
- `activationEvents`: derived automatically from the command contribution
  (no explicit entry needed on modern engines)
- `scripts`: `compile` (`tsc -p ./`), `watch` (`tsc -watch -p ./`), `test`

### Pure logic — `src/resolveTargetDir.ts`

```
resolveTargetDir(fsPath: string, isDirectory: boolean): string
```

- `isDirectory === true` → return `fsPath` unchanged.
- `isDirectory === false` → return `path.dirname(fsPath)`.

Pure and dependency-free (only `node:path`). Unit-tested.

### Entry — `src/extension.ts`

- `activate(context)` registers command `terragruntApply.applyHere`.
- Handler signature: `(uri?: vscode.Uri)` — the clicked explorer resource.
- Steps:
  1. If no `uri` (e.g. invoked from command palette), show warning
     "Right-click a file or folder to use Terragrunt Apply." and return.
  2. `stat = await vscode.workspace.fs.stat(uri)`; determine
     `isDirectory = stat.type === vscode.FileType.Directory`.
     On stat failure, show error message and return.
  3. `dir = resolveTargetDir(uri.fsPath, isDirectory)`.
  4. `const terminal = vscode.window.createTerminal({ name: 'Terragrunt apply', cwd: dir })`.
  5. `terminal.show()`.
  6. `terminal.sendText('terragrunt apply')`.
- `deactivate()` is a no-op.

The `cwd` terminal option sets the working directory natively, so paths with
spaces need no quoting and no `cd` is sent. The interactive apply prompt stays
intact because no `-auto-approve` flag is passed.

## Data Flow

```
explorer right-click (file .hcl/.tf or folder)
  → command terragruntApply.applyHere(uri)
  → vscode.workspace.fs.stat(uri) → isDirectory
  → resolveTargetDir(uri.fsPath, isDirectory) → dir
  → createTerminal({ cwd: dir }) → show() → sendText('terragrunt apply')
```

## Error Handling

- Missing `uri`: warning message, no-op.
- `stat` failure: error message, no-op.

## Testing

- Unit test `resolveTargetDir`:
  - file path → parent directory
  - directory path → same path
- Skip `@vscode/test-electron` end-to-end tests: low value for this scope, heavy
  setup. Terminal/command wiring is verified manually.

## Manual Verification / Install

- Try it: press F5 to launch the Extension Development Host; right-click a `.tf`,
  `.hcl`, or folder; confirm a "Terragrunt apply" terminal opens in the right
  directory and shows `terragrunt apply` awaiting confirmation.
- Install locally: `vsce package` → produces a `.vsix` →
  `code --install-extension <file>.vsix`.

## Out of Scope (YAGNI)

- Auto-approve toggle / configuration settings.
- Multi-select apply (only the primary clicked resource is used).
- Running `plan`, `destroy`, or other terragrunt subcommands.
- Detecting whether `terragrunt.hcl` actually exists in the target dir.
