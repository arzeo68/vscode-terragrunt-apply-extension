# Terragrunt Apply Here

A VSCode extension that adds a **Terragrunt** submenu to the file explorer
right-click menu. It opens a new terminal and runs a `terragrunt apply` variant
in the selected location.

## Behaviour

Right-click a **file** (`.hcl` or `.tf`) or a **folder** → hover **Terragrunt**
to reveal three options:

| Menu item              | Command run                          |
| ---------------------- | ------------------------------------ |
| Apply                  | `terragrunt apply`                   |
| Apply (source update)  | `terragrunt apply --source-update`   |
| Apply (auto approve)   | `terragrunt apply --auto-approve`    |

- A **file** runs in its parent directory; a **folder** runs in that folder.
- **Apply** and **Apply (source update)** are interactive — you confirm
  `yes`/`no` in the terminal. **Apply (auto approve)** skips the confirmation.
- Each invocation opens a fresh terminal named `Terragrunt`.

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
code --install-extension terragrunt-apply-0.1.0.vsix
```
