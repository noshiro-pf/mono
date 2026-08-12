import * as assert from 'node:assert/strict';
import { RepositoryRuleset } from 'octokit-safe-types';

// The package ships runtime validators alongside the types, so a response
// from the GitHub API can be checked rather than asserted.
const ruleset = RepositoryRuleset.fill({
  id: 1,
  name: 'main',
  target: 'branch',
  enforcement: 'active',
});

assert.equal(ruleset.name, 'main');
assert.equal(ruleset.enforcement, 'active');
assert.equal(Array.isArray(ruleset.rules), true);

console.info('octokit-safe-types ok');
