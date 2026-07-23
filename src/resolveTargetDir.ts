import * as path from 'node:path';

/**
 * Resolve the directory terragrunt should run in for a clicked explorer resource.
 * Folders resolve to themselves; files resolve to their parent directory.
 */
export function resolveTargetDir(fsPath: string, isDirectory: boolean): string {
  return isDirectory ? fsPath : path.dirname(fsPath);
}

/**
 * Determine whether a vscode FileStat type represents a directory.
 * `FileType` is a bitmask (a symlinked directory is `Directory | SymbolicLink`),
 * so test the Directory bit rather than comparing for equality.
 */
export function isDirectoryType(fileType: number, directoryFlag: number): boolean {
  return (fileType & directoryFlag) === directoryFlag;
}
