import * as t from 'ts-fortress';

type SemVer = `${number}.${number}.${number}`;

const SemVer = t.templateLiteral<SemVer>({
  is: (value: unknown): value is SemVer =>
    typeof value === 'string' && /^\d+\.\d+\.\d+$/u.test(value),
  typeName: 'SemVer',
  defaultValue: '0.0.0',
});

assert.isTrue(SemVer.is('1.2.3'));

assert.isTrue(SemVer.is('10.20.30'));

assert.isFalse(SemVer.is('1.2'));

assert.isFalse(SemVer.is('1.2.3.4'));
