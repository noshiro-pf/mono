import { isNonNullObject } from 'ts-data-forge';

/**
 * Whether discord.js handed over a partial rather than a complete object.
 *
 * Takes `unknown` on purpose. discord.js types `messageUpdate`'s `newMessage`
 * as a complete `Message` whose `partial` is the literal `false`, which holds
 * only for a client that does not ask for `Partials.Message`. This one does, so
 * `MessageUpdateAction` can hand an uncached message over as a partial —
 * `content` is `null` there, and `updatePollTitle` reads `content`. A guard
 * declared over the discord.js types would narrow the argument to `never`
 * (`Message['partial']` is `false`, `PartialMessage['partial']` is `true`);
 * returning a plain `boolean` leaves both branches typed as `Message`.
 *
 * `partial` is a getter on the prototype of every discord.js structure, never
 * an own property, so it is read through the prototype chain with
 * `Reflect.get`: `hasKey` (`Object.hasOwn`) is `false` for it on every
 * instance.
 */
export const isPartial = (value: unknown): boolean =>
  isNonNullObject(value) && Reflect.get(value, 'partial') === true;
