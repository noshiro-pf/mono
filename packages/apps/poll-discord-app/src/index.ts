#!/usr/bin/env node

/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference path="./globals.d.ts" />

import { main } from './main';

main()
  .then((res) => {
    if (Result.isErr(res)) {
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  })
  .catch(() => undefined);
