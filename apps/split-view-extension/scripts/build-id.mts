/**
 * A name for one build, in the shape changesets gives its files: three words
 * that are easy to read out loud and hard to confuse with the previous one.
 *
 * It exists so that the split view can say which build it is running. An
 * unpacked extension is reloaded by hand, and "did the reload take?" is
 * otherwise unanswerable from the page — the manifest's version only changes
 * when someone edits it.
 */
const adjectives: readonly string[] = [
  'brave',
  'calm',
  'clever',
  'eager',
  'gentle',
  'happy',
  'lucky',
  'mellow',
  'neat',
  'proud',
  'quiet',
  'swift',
  'tidy',
  'warm',
  'wise',
  'zesty',
] as const;

const creatures: readonly string[] = [
  'badgers',
  'beetles',
  'cranes',
  'dolphins',
  'foxes',
  'geese',
  'herons',
  'lemurs',
  'moths',
  'otters',
  'pandas',
  'ravens',
  'seals',
  'turtles',
  'weasels',
  'yaks',
] as const;

const verbs: readonly string[] = [
  'argue',
  'build',
  'dance',
  'dream',
  'gather',
  'jump',
  'listen',
  'paint',
  'rescue',
  'shine',
  'sing',
  'sleep',
  'travel',
  'wander',
  'whistle',
  'wonder',
] as const;

const pick = (words: readonly string[]): string =>
  words[Math.floor(Math.random() * words.length)] ?? words[0] ?? 'unknown';

/** For example `swift-otters-wander (2026-09-10 02:14 UTC)`. */
export const makeBuildId = (): string => {
  const words = [pick(adjectives), pick(creatures), pick(verbs)].join('-');

  // `Intl` rather than `Date`, because the lint rules ask for `Temporal` in
  // place of `new Date()` and the toolchain has no type definitions for it yet.
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'UTC',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return `${words} (${formatter.format(Date.now())} UTC)`;
};
