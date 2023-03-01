#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./globals.d.ts" />

// eslint-disable-next-line import/no-unassigned-import
import '@noshiro/global-ts-utils';

import { main } from './main';

// main()
//   .then((res) => {
//     if (Result.isErr(res)) {
//       console.error(res.value);
//       process.exit(1);
//     }
//   })
//   .catch(noop);

main();
