/// <reference path="./lib.esnext.temporal.d.ts" />

interface Date {
  toTemporalInstant(): Temporal.Instant;
}
