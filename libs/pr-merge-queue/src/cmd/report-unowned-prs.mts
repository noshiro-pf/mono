#!/usr/bin/env node

import { Arr, Result, unknownToString } from 'ts-data-forge';
import {
  REPORT_UNOWNED_PRS_HELP,
  reportUnownedPrs,
} from '../report-unowned-prs/index.mjs';

const args = Arr.skip(process.argv, 2).filter((arg) => arg !== '--');

if (args.includes('--help') || args.includes('-h')) {
  console.info(REPORT_UNOWNED_PRS_HELP);

  process.exit(0);
}

const unknown = args.filter((arg) => arg !== '--dry-run');

if (Arr.isNonEmpty(unknown)) {
  console.error(
    `unexpected argument: ${unknown.join(' ')}\n\n${REPORT_UNOWNED_PRS_HELP}`,
  );

  process.exit(1);
}

const result = await reportUnownedPrs(args.includes('--dry-run')).catch(
  (error: unknown) => Result.err(unknownToString(error)),
);

if (Result.isErr(result)) {
  console.error(result.value);

  process.exit(1);
}

console.info(result.value);
