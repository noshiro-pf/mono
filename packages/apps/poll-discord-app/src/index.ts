#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./globals.d.ts" />

import { main } from './main';

main()
  .then((res) => {
    if (Result.isErr(res)) {
      process.exit(1);
    }
  })
  .catch(() => undefined);
