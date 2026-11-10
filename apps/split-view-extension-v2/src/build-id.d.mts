/**
 * The build's name, replaced at build time by Vite's `define`. See
 * `scripts/build-id.mts` for why it exists.
 */
declare const SPLIT_VIEW_BUILD_ID: string;

/**
 * Whether this build carries the diagnostics — the event log, the rule-match
 * feedback and the panel that shows them. False in a production build, where
 * the permissions they need are not in the manifest either.
 */
declare const SPLIT_VIEW_DIAGNOSTICS: boolean;
