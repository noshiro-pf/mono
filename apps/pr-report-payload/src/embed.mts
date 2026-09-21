/** The two blocks this repository's reports carry, by name. */

import { type Result } from 'ts-data-forge';
import { embedBlock, extractBlock } from './block.mjs';
import {
  PAYLOAD_VERSION,
  PrReportPayloadSchema,
  type PrReportPayload,
} from './payload.mjs';
import {
  RUN_LOG_VERSION,
  UnblockPrsLogSchema,
  type UnblockPrsLog,
} from './run-log.mjs';

/** The open pull request report, for the issue `pr-report.yml` writes. */
export const embedPayload = (payload: PrReportPayload): string =>
  embedBlock('pr-report:payload', payload);

export const extractPayload = (
  issueBody: string,
): Result<PrReportPayload, string> =>
  extractBlock(
    'pr-report:payload',
    PAYLOAD_VERSION,
    PrReportPayloadSchema,
    issueBody,
  );

/** What `unblock-prs` did, for the issue that script writes. */
export const embedRunLog = (log: UnblockPrsLog): string =>
  embedBlock('unblock-prs:log', log);

export const extractRunLog = (
  issueBody: string,
): Result<UnblockPrsLog, string> =>
  extractBlock(
    'unblock-prs:log',
    RUN_LOG_VERSION,
    UnblockPrsLogSchema,
    issueBody,
  );
