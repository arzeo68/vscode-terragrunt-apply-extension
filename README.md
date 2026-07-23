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
