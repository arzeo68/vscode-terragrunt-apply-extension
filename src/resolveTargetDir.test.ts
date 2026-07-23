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
