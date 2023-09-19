import { expectType } from '@noshiro/ts-utils';
import {
  type LambdaAbstraction,
  type LambdaApplication,
  type LambdaTerm,
} from './lambda-term';
import { type Variable } from './variable';

describe('test types', () => {
  test('dummy', () => {
    expect(0).toBe(0);
  });

  const l1 = 'x';
  const l2 = ['x', 'x'] as const;
  const l3 = ['x', ['y', 'y']] as const;
  const l4 = [
    ['x', ['y', 'y']],
    ['x', ['y', 'y']],
  ] as const;
  const l5 = ['lambda', 'x', ['x', ['y', 'y']]] as const;

  expectType<typeof l1, LambdaTerm>('<=');
  expectType<typeof l1, Variable>('<=');
  expectType<typeof l1, LambdaApplication>('!<=');
  expectType<typeof l1, LambdaAbstraction>('!<=');

  expectType<typeof l2, LambdaTerm>('<=');
  expectType<typeof l2, Variable>('!<=');
  expectType<typeof l2, LambdaApplication>('<=');
  expectType<typeof l2, LambdaAbstraction>('!<=');

  expectType<typeof l3, LambdaTerm>('<=');
  expectType<typeof l3, Variable>('!<=');
  expectType<typeof l3, LambdaApplication>('<=');
  expectType<typeof l3, LambdaAbstraction>('!<=');

  expectType<typeof l4, LambdaTerm>('<=');
  expectType<typeof l4, Variable>('!<=');
  expectType<typeof l4, LambdaApplication>('<=');
  expectType<typeof l4, LambdaAbstraction>('!<=');

  expectType<typeof l5, LambdaTerm>('<=');
  expectType<typeof l5, Variable>('!<=');
  expectType<typeof l5, LambdaApplication>('!<=');
  expectType<typeof l5, LambdaAbstraction>('<=');
});
