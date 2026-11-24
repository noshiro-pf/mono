import { stackFoldsKey } from './settings-db.mjs';

test(stackFoldsKey, () => {
  // v1's key, lower-cased as GitHub matches names, so the swap keeps the folds.
  assert.strictEqual(
    stackFoldsKey({ owner: 'Noshiro-PF', name: 'Mono' }),
    'stack-folds:noshiro-pf/mono',
  );
});
