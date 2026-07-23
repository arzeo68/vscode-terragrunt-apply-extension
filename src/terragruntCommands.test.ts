import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { TERRAGRUNT_COMMANDS } from './terragruntCommands';

test('defines the three apply variants with the correct terminal input', () => {
  const byId = Object.fromEntries(
    TERRAGRUNT_COMMANDS.map((c) => [c.id, c.terminalInput])
  );
  assert.equal(byId['terragruntApply.apply'], 'terragrunt apply');
  assert.equal(
    byId['terragruntApply.applySourceUpdate'],
    'terragrunt apply --source-update'
  );
  assert.equal(
    byId['terragruntApply.applyAutoApprove'],
    'terragrunt apply --auto-approve'
  );
});

test('command ids are unique', () => {
  const ids = TERRAGRUNT_COMMANDS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('manifest command ids match the code definitions', () => {
  const pkg = JSON.parse(
    readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
  );
  const manifestIds = pkg.contributes.commands
    .map((c: { command: string }) => c.command)
    .sort();
  const codeIds = TERRAGRUNT_COMMANDS.map((c) => c.id).sort();
  assert.deepEqual(manifestIds, codeIds);
});
