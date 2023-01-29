#!/usr/bin/env node

/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference no-default-lib="true"/>
/// <reference path="../../../utils/stdlib/dist/lib.dom.d.ts" />
/// <reference path="../../../utils/stdlib/dist/lib.esnext.d.ts" />
/// <reference path="../../../utils/ts-type-utils/ts-type-utils.d.ts" />
/// <reference path="../../../utils/global-syncflow/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-ts-utils/esm/globals-decl.d.ts" />

import { main } from './main';

main()
  .then((res) => {
    if (Result.isErr(res)) {
      process.exit(1);
    }
  })
  .catch(() => undefined);
