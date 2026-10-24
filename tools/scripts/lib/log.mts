/** The log line every long-running command writes. */

export const log = (message: string): void => {
  console.info(logLine(message));
};

/**
 * `message` stamped with the time in the machine's time zone (`TZ`), because
 * the person reading the log reads it against their own clock. The offset
 * stays in the stamp, so a line pasted elsewhere still names one instant.
 */
export const logLine = (
  message: string,
  now: Temporal.ZonedDateTime = Temporal.Now.zonedDateTimeISO(),
): string =>
  `[${now.toString({ smallestUnit: 'millisecond', timeZoneName: 'never' })}] ${message}` as const;
