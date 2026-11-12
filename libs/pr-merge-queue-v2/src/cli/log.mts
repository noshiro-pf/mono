/** The log line of a long-running command (`spec/worker.md`, "Options"). */

/**
 * `message` stamped with the local time to the millisecond and its offset from
 * UTC (`[2026-09-27T21:03:04.500+09:00]`): read against the reader's own clock,
 * and still one instant when pasted elsewhere. `offsetMinutes` (east of UTC) is
 * the machine's at that instant.
 */
export const logLine = (
  message: string,
  epochMs: number,
  offsetMinutes: number,
): string => {
  const date = new Date(epochMs + offsetMinutes * 60_000);

  const local = date.toISOString().slice(0, 23);

  const sign = offsetMinutes < 0 ? '-' : '+';

  const hours = Math.floor(Math.abs(offsetMinutes) / 60)
    .toString()
    .padStart(2, '0');

  const minutes = (Math.abs(offsetMinutes) % 60).toString().padStart(2, '0');

  return `[${local}${sign}${hours}:${minutes}] ${message}` as const;
};

/** The machine's (`TZ`) offset from UTC at `epochMs`, in minutes east. */
export const machineOffsetMinutes = (epochMs: number): number => {
  const date = new Date(epochMs);

  return -date.getTimezoneOffset();
};
