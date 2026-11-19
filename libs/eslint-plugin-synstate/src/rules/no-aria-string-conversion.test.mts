import { RuleTester } from '@typescript-eslint/rule-tester';
import { noAriaStringConversion } from './no-aria-string-conversion.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

const error = { messageId: 'stringConversion' } as const;

ruleTester.run('no-aria-string-conversion', noAriaStringConversion, {
  valid: [
    {
      name: 'a boolean, as synstate-dom writes it',
      code: 'const a = <div aria-expanded={open$} aria-pressed={pressed} />;',
    },
    {
      name: 'a literal string',
      code: "const a = <span aria-hidden={constant('true')} />;",
    },
    {
      name: "'true' or no attribute is not a conversion of a boolean",
      code: "const a = <a aria-current={sort === 'name' ? 'true' : undefined} />;",
    },
    {
      name: 'a string-valued attribute may convert',
      code: 'const a = <div aria-label={String(count)} aria-controls={id.toString()} />;',
    },
    {
      name: 'a conversion that is not the last step',
      code: 'const a = <div aria-valuenow={toNumber(String(x))} />;',
    },
    {
      name: 'an attribute that is not aria-*',
      code: 'const a = <div data-open={open.toString()} />;',
    },
  ],
  invalid: [
    {
      name: 'map(String)',
      code: 'const a = <button aria-pressed={closed$.pipe(map(String))} />;',
      errors: [error],
    },
    {
      name: "? 'true' : 'false' in a projection",
      code: "const a = <td aria-selected={cell.pipe(map((c) => (c.selected ? 'true' : 'false')))} />;",
      errors: [error],
    },
    {
      name: "? 'false' : 'true', on any aria-* attribute",
      code: "const a = <a aria-current={here ? 'false' : 'true'} />;",
      errors: [error],
    },
    {
      name: '.toString() through an optional chain',
      code: 'const a = <div aria-pressed={item$.pipe(map((item) => item.pressed?.toString()))} />;',
      errors: [error],
    },
    {
      name: '.toString() returned from a block body',
      code: 'const a = <div aria-expanded={open$.pipe(map((open) => { return open.toString(); }))} />;',
      errors: [error],
    },
    {
      name: 'String() as the value itself, seen through type wrappers',
      code: 'const a = <div aria-valuenow={(String(n) as string)!} />;',
      errors: [error],
    },
    {
      name: 'a conversion in one branch',
      code: 'const a = <div aria-expanded={shown ? open.toString() : undefined} />;',
      errors: [error],
    },
  ],
});
