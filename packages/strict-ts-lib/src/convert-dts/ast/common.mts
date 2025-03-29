import { Lang, parse } from '@ast-grep/napi';
import { type Result } from '@noshiro/mono-utils';
import { typeUtilsName } from '../../constants.mjs';
import { composeReplaceOperations } from './utils/index.mjs';

export const convertAstCommon = (src: string): Result<string, string> => {
  const ast = parse(Lang.TypeScript, src);
  const root = ast.root();
  return composeReplaceOperations(root, [
    [
      [
        `/*! *****************************************************************************`,
        `Copyright (c) Microsoft Corporation. All rights reserved.`,
        `Licensed under the Apache License, Version 2.0 (the "License"); you may not use`,
        `this file except in compliance with the License. You may obtain a copy of the`,
        `License at http://www.apache.org/licenses/LICENSE-2.0`,
        ``,
        `THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY`,
        `KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED`,
        `WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,`,
        `MERCHANTABLITY OR NON-INFRINGEMENT.`,
        ``,
        `See the Apache Version 2.0 License for specific language governing permissions`,
        `and limitations under the License.`,
        `***************************************************************************** */`,
      ].join('\n'),
      '',
    ],
    [
      '/// <reference no-default-lib="true"/>',
      [
        '/// <reference no-default-lib="true"/>',
        `/// <reference types="${typeUtilsName}" />`,
      ].join('\n'),
      { onNotFound: 'off' },
    ],
  ]);
};
