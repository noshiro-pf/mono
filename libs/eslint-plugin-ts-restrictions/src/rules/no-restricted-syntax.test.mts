import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { noRestrictedSyntax } from './no-restricted-syntax.mjs';

const tester = new RuleTester({
  languageOptions: { parser, parserOptions: { sourceType: 'module' } },
});

describe('no-restricted-syntax', () => {
  tester.run('no-restricted-syntax', noRestrictedSyntax, {
    valid: [
      { name: 'no selectors: nothing is restricted', code: 'with_(a);' },
      {
        name: 'a selector that matches nothing',
        code: 'const a = 1;',
        options: ['WithStatement'],
      },
    ],
    invalid: [
      {
        name: 'a string selector: the default message',
        code: 'const a = 1;',
        options: ['VariableDeclaration'],
        errors: [
          {
            messageId: 'restrictedSyntax',
            data: { message: "Using 'VariableDeclaration' is not allowed." },
          },
        ],
      },
      {
        name: 'an object selector: its own message',
        code: 'foo();',
        options: [
          { selector: "CallExpression[callee.name='foo']", message: 'No foo.' },
        ],
        errors: [
          { messageId: 'restrictedSyntax', data: { message: 'No foo.' } },
        ],
      },
      {
        name: 'several selectors, each reported',
        code: 'foo(); const a = 1;',
        options: [
          'VariableDeclaration',
          { selector: 'CallExpression', message: 'No calls.' },
        ],
        errors: [
          { messageId: 'restrictedSyntax', data: { message: 'No calls.' } },
          {
            messageId: 'restrictedSyntax',
            data: { message: "Using 'VariableDeclaration' is not allowed." },
          },
        ],
      },
    ],
  });
});
