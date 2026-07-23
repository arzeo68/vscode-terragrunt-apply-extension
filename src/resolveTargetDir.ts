import * as path from 'node:path';

/**
 * Resolve the directory terragrunt should run in for a clicked explorer resource.
 * Folders resolve to themselves; files resolve to their parent directory.
 */
export function resolveTargetDir(fsPath: string, isDirectory: boolean): string {
  return isDirectory ? fsPath : path.dirname(fsPath);
}
