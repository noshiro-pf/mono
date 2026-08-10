#!/usr/bin/env node

/// <reference path="./globals.d.ts" />

import { main } from './main.mjs';

main()
  .then((res) => {
    if (Result.isErr(res)) {
      process.exit(1);
    }
  })
  .catch(() => undefined);
