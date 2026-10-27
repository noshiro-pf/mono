/** The log line every long-running command writes. */

import { currentEpochMs, localTimestamp } from './time.mjs';

export const log = (message: string): void => {
  console.info(logLine(message));
};

/**
 * `message` stamped with the time in the machine's time zone (`TZ`), because
 * the person reading the log reads it against their own clock. The offset
 * stays in the stamp, so a line pasted elsewhere still names one instant.
 * `offsetMinutes` (east of UTC) is the machine's unless given.
 */
export const logLine = (
  message: string,
  epochMs: number = currentEpochMs(),
  offsetMinutes?: number,
): string => `[${localTimestamp(epochMs, offsetMinutes)}] ${message}` as const;
