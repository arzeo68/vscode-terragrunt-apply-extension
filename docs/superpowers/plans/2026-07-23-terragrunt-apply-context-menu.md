# Terragrunt Apply Context Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A VSCode extension that adds an explorer right-click item to open a terminal and run `terragrunt apply` at the selected file's directory (or the selected folder).

**Architecture:** Plain TypeScript extension compiled with `tsc`. Manifest declares one command contributed to `explorer/context`. A pure `resolveTargetDir` function maps the clicked resource to a working directory (file → parent dir, folder → itself). The command handler stats the URI, resolves the dir, and opens a fresh terminal with that `cwd` running `terragrunt apply`.

**Tech Stack:** TypeScript, VSCode Extension API (`^1.90.0`), Node.js built-in test runner via `tsx`, `node:path`.

## Global Constraints

- VSCode engine floor: `^1.90.0` (must match `@types/vscode`).
- Apply mode is interactive — command sent is exactly `terragrunt apply`, never `-auto-approve`.
- Menu `when` clause is exactly: `explorerResourceIsFolder || resourceExtname == .hcl || resourceExtname == .tf`.
- A fresh terminal is created per invocation (no reuse).
- No bundler. Extension entry is `./out/extension.js` compiled from `src/`.
- `resolveTargetDir` depends only on `node:path` — never imports `vscode` — so it is unit-testable outside the extension host.

---

### Task 1: Project scaffold, manifest, and tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.vscodeignore`
- Create: `.vscode/launch.json`
- Create: `.vscode/tasks.json`

**Interfaces:**
- Consumes: nothing.
- Produces: command id `terragruntApply.applyHere`; extension entry `./out/extension.js`; npm scripts `compile`, `watch`, `test`, `package`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "terragrunt-apply",
  "displayName": "Terragrunt Apply Here",
  "description": "Right-click a file or folder to run terragrunt apply at that location.",
  "version": "0.0.1",
  "publisher": "local",
  "engines": { "vscode": "^1.90.0" },
  "categories": ["Other"],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      { "command": "terragruntApply.applyHere", "title": "Terragrunt Apply Here" }
    ],
    "menus": {
      "explorer/context": [
        {
          "command": "terragruntApply.applyHere",
          "when": "explorerResourceIsFolder || resourceExtname == .hcl || resourceExtname == .tf",
          "group": "navigation@99"
        }
      ]
    }
  },
  "scripts": {
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "test": "tsx --test src/**/*.test.ts",
    "package": "vsce package"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/vscode": "^1.90.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2022",
    "lib": ["ES2022"],
    "outDir": "out",
    "rootDir": "src",
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "exclude": ["node_modules", ".vscode-test", "out", "**/*.test.ts"]
}
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
out/
*.vsix
.vscode-test/
```

- [ ] **Step 4: Create `.vscodeignore`** (keeps source/config out of the packaged `.vsix`)

```
.vscode/**
src/**
docs/**
node_modules/**
tsconfig.json
.gitignore
**/*.test.*
**/*.map
```

- [ ] **Step 5: Create `.vscode/launch.json`** (F5 → Extension Development Host)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
      "outFiles": ["${workspaceFolder}/out/**/*.js"],
      "preLaunchTask": "npm: compile"
    }
  ]
}
```

- [ ] **Step 6: Create `.vscode/tasks.json`**

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "compile",
      "problemMatcher": "$tsc",
      "group": "build",
      "label": "npm: compile"
    }
  ]
}
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`
Expected: completes without error; `node_modules/` created; `package-lock.json` written.

- [ ] **Step 8: Verify the toolchain resolves**

Run: `npx tsc --version && npx tsx --version`
Expected: prints a TypeScript version (5.x) and a tsx version (4.x), no error.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json .gitignore .vscodeignore .vscode
git commit -m "Scaffold VSCode extension: manifest, tsconfig, dev tooling"
```

---

### Task 2: `resolveTargetDir` pure function (TDD)

**Files:**
- Create: `src/resolveTargetDir.ts`
- Test: `src/resolveTargetDir.test.ts`

**Interfaces:**
- Consumes: `node:path`.
- Produces: `resolveTargetDir(fsPath: string, isDirectory: boolean): string` — returns `fsPath` when `isDirectory` is true, otherwise `path.dirname(fsPath)`.

- [ ] **Step 1: Write the failing test** — create `src/resolveTargetDir.test.ts`

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'node:path';
import { resolveTargetDir } from './resolveTargetDir';

test('file path resolves to its parent directory', () => {
  const file = path.join('envs', 'prod', 'main.tf');
  assert.equal(resolveTargetDir(file, false), path.join('envs', 'prod'));
});

test('directory path resolves to itself', () => {
  const dir = path.join('envs', 'prod');
  assert.equal(resolveTargetDir(dir, true), dir);
});

test('hcl file resolves to its parent directory', () => {
  const file = path.join('live', 'us-east-1', 'terragrunt.hcl');
  assert.equal(resolveTargetDir(file, false), path.join('live', 'us-east-1'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve module `./resolveTargetDir` (file does not exist yet).

- [ ] **Step 3: Write minimal implementation** — create `src/resolveTargetDir.ts`

```ts
import * as path from 'node:path';

/**
 * Resolve the directory terragrunt should run in for a clicked explorer resource.
 * Folders resolve to themselves; files resolve to their parent directory.
 */
export function resolveTargetDir(fsPath: string, isDirectory: boolean): string {
  return isDirectory ? fsPath : path.dirname(fsPath);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/resolveTargetDir.ts src/resolveTargetDir.test.ts
git commit -m "Add resolveTargetDir: map clicked resource to terragrunt working dir"
```

---

### Task 3: Extension entry point and command wiring

**Files:**
- Create: `src/extension.ts`

**Interfaces:**
- Consumes: `resolveTargetDir(fsPath, isDirectory)` from Task 2; `vscode` API.
- Produces: `activate(context: vscode.ExtensionContext): void` and `deactivate(): void`. Registers command `terragruntApply.applyHere`.

- [ ] **Step 1: Write the entry point** — create `src/extension.ts`

```ts
import * as vscode from 'vscode';
import { resolveTargetDir } from './resolveTargetDir';

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
        isDirectory = stat.type === vscode.FileType.Directory;
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
```

- [ ] **Step 2: Compile the extension**

Run: `npm run compile`
Expected: PASS — no type errors; `out/extension.js` and `out/resolveTargetDir.js` are produced.

- [ ] **Step 3: Verify the build output exists**

Run: `test -f out/extension.js && echo OK`
Expected: prints `OK`.

- [ ] **Step 4: Run the unit tests again (regression check)**

Run: `npm test`
Expected: PASS — the Task 2 tests still pass (adding `extension.ts` did not break them).

- [ ] **Step 5: Commit**

```bash
git add src/extension.ts
git commit -m "Add extension entry: register applyHere command, open terminal, run terragrunt apply"
```

---

### Task 4: Manual verification and local packaging

**Files:**
- Create: `README.md`

This task has no automated tests — it verifies the wired extension in a real VSCode host and documents usage/install.

- [ ] **Step 1: Create `README.md`**

```markdown
# Terragrunt Apply Here

A VSCode extension that adds a **Terragrunt Apply Here** item to the file
explorer right-click menu. It opens a new terminal and runs `terragrunt apply`
in the selected location.

## Behaviour

- Right-click a **file** (`.hcl` or `.tf`) → runs in the file's parent directory.
- Right-click a **folder** → runs in that folder.
- The apply is **interactive** — you confirm `yes`/`no` in the terminal.
- Each invocation opens a fresh terminal named `Terragrunt apply`.

## Develop

```bash
npm install
npm run compile
npm test
```

Press `F5` to launch the Extension Development Host and try the menu item.

## Install locally

```bash
npm run package        # produces terragrunt-apply-<version>.vsix
code --install-extension terragrunt-apply-0.0.1.vsix
```
```

- [ ] **Step 2: Launch the Extension Development Host**

Press `F5` in VSCode (uses `.vscode/launch.json`; compiles first via the preLaunch task).
Expected: a second `[Extension Development Host]` window opens.

- [ ] **Step 3: Verify the menu item appears with correct visibility**

In the dev-host window, open a folder containing `.tf`/`.hcl` files and subfolders, then:
- Right-click a `.tf` file → **Terragrunt Apply Here** is present.
- Right-click a `.hcl` file → item is present.
- Right-click a folder → item is present.
- Right-click a non-terraform file (e.g. `README.md`) → item is **absent**.

- [ ] **Step 4: Verify behaviour**

- Right-click a `.tf` file, choose **Terragrunt Apply Here** → a terminal named `Terragrunt apply` opens with `cwd` set to the file's parent directory and `terragrunt apply` typed/run, awaiting confirmation.
- Right-click a folder, choose the item → terminal opens with `cwd` set to that folder.

- [ ] **Step 5: Package (optional, verifies the manifest is publishable)**

Run: `npx @vscode/vsce package`
Expected: produces `terragrunt-apply-0.0.1.vsix` with no manifest errors.

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "Add README with usage, develop, and install instructions"
```

---

## Notes for the implementer

- `vscode.window.createTerminal({ cwd })` sets the working directory natively — do **not** send a `cd` command and do **not** quote the path; paths with spaces are handled by the API.
- The `vscode` module only exists inside the extension host, which is why unit tests target `resolveTargetDir` (no `vscode` import) rather than `extension.ts`.
- If `npm test` reports no test files matched, confirm the glob `src/**/*.test.ts` matches your shell; `tsx --test` expands it via its own matcher, so run through the npm script rather than typing the glob directly in some shells.
