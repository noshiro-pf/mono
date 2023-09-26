import { expectType } from '@noshiro/ts-utils';
import { type LambdaTerm } from './lambda-term';
import { type NumberTerm, type NumberTermBody } from './number-term';

describe('test types', () => {
  test('dummy', () => {
    expect(0).toBe(0);
  });

  ['lambda', 's', ['lambda', 'z', 'z']] as const satisfies NumberTerm<'s', 'z'>;

  ['lambda', 's', ['lambda', 'z', ['s', 'z']]] as const satisfies NumberTerm<
    's',
    'z'
  >;

  [
    'lambda',
    's',
    ['lambda', 'z', ['s', ['s', 'z']]],
  ] as const satisfies NumberTerm<'s', 'z'>;

  [
    'lambda',
    's',
    ['lambda', 'z', ['s', ['s', ['s', 'z']]]],
  ] as const satisfies NumberTerm<'s', 'z'>;

  expectType<NumberTerm<'s', 'z'>, LambdaTerm>('<=');
  expectType<NumberTerm<'s', 'z'>, LambdaTerm>('<=');

  expectType<'z', NumberTermBody<'s', 'z'>>('<=');
  expectType<['s', 'z'], NumberTermBody<'s', 'z'>>('<=');
  expectType<['s', ['s', 'z']], NumberTermBody<'s', 'z'>>('<=');
  expectType<['s', ['s', ['s', 'z']]], NumberTermBody<'s', 'z'>>('<=');
});
