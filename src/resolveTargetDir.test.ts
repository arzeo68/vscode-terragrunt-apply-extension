import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as path from 'node:path';
import { resolveTargetDir, isDirectoryType } from './resolveTargetDir';

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

const DIRECTORY = 2; // vscode.FileType.Directory
const SYMLINK = 64;  // vscode.FileType.SymbolicLink
const FILE = 1;      // vscode.FileType.File

test('plain directory type is a directory', () => {
  assert.equal(isDirectoryType(DIRECTORY, DIRECTORY), true);
});

test('symlinked directory is a directory', () => {
  assert.equal(isDirectoryType(DIRECTORY | SYMLINK, DIRECTORY), true);
});

test('plain file type is not a directory', () => {
  assert.equal(isDirectoryType(FILE, DIRECTORY), false);
});

test('symlinked file is not a directory', () => {
  assert.equal(isDirectoryType(FILE | SYMLINK, DIRECTORY), false);
});
