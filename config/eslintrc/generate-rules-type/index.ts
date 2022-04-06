/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference no-default-lib="true"/>
/// <reference path="../../../packages/utils/stdlib/dist/lib.dom.d.ts" />
/// <reference path="../../../packages/utils/stdlib/dist/lib.esnext.d.ts" />
/// <reference path="../../../packages/utils/ts-type-utils/ts-type-utils.d.ts" />

import { main } from './generate-rules-type';

main().catch(console.error);
