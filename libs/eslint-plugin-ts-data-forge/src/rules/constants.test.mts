import { RuleTester } from '@typescript-eslint/rule-tester';
import { hasKey, isRecord } from 'ts-data-forge';

test('every rule test also runs importing the shared exports from the other package', () => {
  // `configs/module-parity.setup.mts`, a Vitest setup file, marks the patched
  // class with this key (`installedMark` in
  // `tools/configs/eslint-rule-module-parity.mts`).
  const prototype: unknown = RuleTester.prototype;

  assert.isTrue(
    isRecord(prototype) &&
      hasKey(prototype, Symbol.for('eslint-rule-module-parity.installed')),
  );
});
