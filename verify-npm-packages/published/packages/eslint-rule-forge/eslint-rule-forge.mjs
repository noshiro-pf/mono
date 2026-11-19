import {
  isTsTypeWrapper,
  skipTsTypeWrappers,
  skipTypeWrappers,
  typeWrapperLayers,
} from 'eslint-rule-forge';
import * as assert from 'node:assert/strict';
import * as ts from 'typescript';

// `x as A satisfies B`, written as the nodes typescript-eslint produces.
const x = { type: 'Identifier', name: 'x' };

const asA = { type: 'TSAsExpression', expression: x };

const satisfiesB = { type: 'TSSatisfiesExpression', expression: asA };

assert.equal(skipTypeWrappers(satisfiesB), x);
assert.deepEqual(typeWrapperLayers(satisfiesB), [satisfiesB, asA, x]);

// `(x satisfies B)`, built with the compiler API.
const tsX = ts.factory.createIdentifier('x');

const parenthesized = ts.factory.createParenthesizedExpression(
  ts.factory.createSatisfiesExpression(
    tsX,
    ts.factory.createTypeReferenceNode('B'),
  ),
);

assert.equal(skipTsTypeWrappers(parenthesized), tsX);
assert.equal(isTsTypeWrapper(parenthesized), true);
assert.equal(isTsTypeWrapper(tsX), false);

console.info('eslint-rule-forge ok');
