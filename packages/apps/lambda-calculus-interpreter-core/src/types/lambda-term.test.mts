import { expectType } from '@noshiro/ts-utils';
import {
  type LambdaAbstraction,
  type LambdaApplication,
  type LambdaTerm,
} from './lambda-term.mjs';
import { type Variable } from './variable.mjs';

describe('test types', () => {
  test('dummy', () => {
    expect(0).toBe(0);
  });

  type l1 = 'x';
  type l2 = readonly ['x', 'x'];
  type l3 = readonly ['x', ['y', 'y']];
  type l4 = DeepReadonly<[['x', ['y', 'y']], ['x', ['y', 'y']]]>;
  type l5 = DeepReadonly<['lambda', 'x', ['x', ['y', 'y']]]>;

  expectType<l1, LambdaTerm>('<=');
  expectType<l1, Variable>('<=');
  expectType<l1, LambdaApplication>('!<=');
  expectType<l1, LambdaAbstraction>('!<=');

  expectType<l2, LambdaTerm>('<=');
  expectType<l2, Variable>('!<=');
  expectType<l2, LambdaApplication>('<=');
  expectType<l2, LambdaAbstraction>('!<=');

  expectType<l3, LambdaTerm>('<=');
  expectType<l3, Variable>('!<=');
  expectType<l3, LambdaApplication>('<=');
  expectType<l3, LambdaAbstraction>('!<=');

  expectType<l4, LambdaTerm>('<=');
  expectType<l4, Variable>('!<=');
  expectType<l4, LambdaApplication>('<=');
  expectType<l4, LambdaAbstraction>('!<=');

  expectType<l5, LambdaTerm>('<=');
  expectType<l5, Variable>('!<=');
  expectType<l5, LambdaApplication>('!<=');
  expectType<l5, LambdaAbstraction>('<=');
});
