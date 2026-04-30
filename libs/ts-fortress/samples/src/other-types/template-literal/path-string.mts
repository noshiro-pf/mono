import * as t from 'ts-fortress';

type PathString = `/${string}`;

const PathString = t.templateLiteral<PathString>({
  is: (value: unknown): value is PathString =>
    typeof value === 'string' && value.startsWith('/'),
  typeName: 'PathString',
  defaultValue: '/',
});

assert.isTrue(PathString.is('/users'));

assert.isTrue(PathString.is('/users/123'));

assert.isFalse(PathString.is('users'));
