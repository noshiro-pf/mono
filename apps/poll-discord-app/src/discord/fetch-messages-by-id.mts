import { Collection, DiscordAPIError, RESTJSONErrorCodes } from 'discord.js';
import { isNotUndefined } from 'ts-data-forge';

/**
 * Fetches each message by its id, unlike a `fetch({ after })` window, which
 * returns 50 messages by default and 100 at most. An empty id and a deleted
 * message are left out; any other error rejects.
 */
export const fetchMessagesById = async <M extends Readonly<{ id: string }>>(
  fetchMessage: (
    options: Readonly<{ message: string; force: true }>,
  ) => Promise<M>,
  ids: readonly string[],
): Promise<Collection<string, M>> => {
  // One request per id, so the count depends on the ids alone and not on what
  // else was said in the channel.
  const fetched = await Promise.all(
    // `fetch` takes an empty `message` as a request for a window, not an id.
    ids
      .filter((id) => id !== '')
      .map(async (id) => {
        try {
          // `force`: fixAnswerAndUpdateMessage repairs answers from the
          // reactions Discord has, not from the cached ones. Every id is
          // forced, even one the cache could serve, which keeps this helper
          // free of knowing which messages need fresh reactions.
          return await fetchMessage({ message: id, force: true });
        } catch (error) {
          if (isUnknownMessage(error)) {
            return undefined;
          }

          // Only Unknown Message means the message was deleted; `runListener`
          // logs a rejection.
          throw error;
        }
      }),
  );

  return new Collection(
    fetched.filter(isNotUndefined).map((message) => [message.id, message]),
  );
};

const isUnknownMessage = (error: unknown): boolean =>
  error instanceof DiscordAPIError &&
  error.code === RESTJSONErrorCodes.UnknownMessage;
