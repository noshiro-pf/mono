import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { importStyleRule } from './import-style.mjs';

const ruleName = 'import-style';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

tester.run(ruleName, importStyleRule, {
  valid: [
    {
      code: "import * as React from 'react';",
    },
    {
      code: "import type * as React from 'react';",
    },
    {
      code: "import { useMemo } from 'react-use';",
    },
  ],
  invalid: [
    {
      code: "import React from 'react';",
      errors: [
        {
          messageId: 'namespaceImportRequired',
        },
      ],
    },
    {
      code: "import { useState } from 'react';",
      errors: [
        {
          messageId: 'namespaceImportRequired',
        },
      ],
    },
    {
      code: "import * as R from 'react';",
      errors: [
        {
          messageId: 'namespaceNameMustBeReact',
        },
      ],
    },
    {
      code: "import React, * as R from 'react';",
      errors: [
        {
          messageId: 'namespaceImportRequired',
        },
      ],
    },
  ],
});
