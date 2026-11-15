/**
 * Namespace providing type guards and runtime-checked casts for the branded
 * length-constrained string types (`MinLengthString`, `MaxLengthString`,
 * `BoundedLengthString`, `FixedLengthString`).
 *
 * Lengths are measured in UTF-16 code units (the same unit as
 * `String.prototype.length`), so characters outside the Basic Multilingual
 * Plane (e.g. emoji) count as 2.
 */
export * as Str from './str-impl.mjs';
