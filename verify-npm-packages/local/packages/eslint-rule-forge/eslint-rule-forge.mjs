import { skipTypeWrappers, typeWrapperLayers } from 'eslint-rule-forge';
import * as assert from 'node:assert/strict';

// `x as A satisfies B`, written as the nodes typescript-eslint produces.
const x = { type: 'Identifier', name: 'x' };

const asA = { type: 'TSAsExpression', expression: x };

const satisfiesB = { type: 'TSSatisfiesExpression', expression: asA };

assert.equal(skipTypeWrappers(satisfiesB), x);
assert.deepEqual(typeWrapperLayers(satisfiesB), [satisfiesB, asA, x]);

console.info('eslint-rule-forge ok');
