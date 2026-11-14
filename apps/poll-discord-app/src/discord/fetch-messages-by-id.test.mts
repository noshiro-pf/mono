import { DiscordAPIError, RESTJSONErrorCodes } from 'discord.js';
import { Arr, asUint32 } from 'ts-data-forge';
import { fetchMessagesById } from './fetch-messages-by-id.mjs';

describe(fetchMessagesById, () => {
  test('fetches every id on its own, however many there are', async () => {
    const ids = Arr.seq(asUint32(60)).map((i) => `id-${i}`);

    const fetchMessage = vi.fn(({ message }: Readonly<{ message: string }>) =>
      Promise.resolve({ id: message }),
    );

    const messages = await fetchMessagesById(fetchMessage, ids);

    assert.deepStrictEqual(Array.from(messages.keys()), ids);

    expect(fetchMessage).toHaveBeenCalledTimes(60);

    expect(fetchMessage).toHaveBeenCalledWith({
      message: 'id-59',
      force: true,
    });
  });

  test('leaves out a message that no longer exists', async () => {
    const messages = await fetchMessagesById(
      ({ message }) =>
        message === 'deleted'
          ? Promise.reject(
              discordApiError(RESTJSONErrorCodes.UnknownMessage, 404),
            )
          : Promise.resolve({ id: message }),
      ['a', 'deleted', 'b'],
    );

    assert.deepStrictEqual(Array.from(messages.keys()), ['a', 'b']);
  });

  test('leaves out an empty id, which names no message, without fetching it', async () => {
    const fetchMessage = vi.fn(({ message }: Readonly<{ message: string }>) =>
      Promise.resolve({ id: message }),
    );

    const messages = await fetchMessagesById(fetchMessage, ['a', '']);

    assert.deepStrictEqual(Array.from(messages.keys()), ['a']);

    expect(fetchMessage).toHaveBeenCalledExactlyOnceWith({
      message: 'a',
      force: true,
    });
  });

  test('rejects with an error that is not a DiscordAPIError', async () => {
    const error = new Error('socket hang up');

    await expect(
      fetchMessagesById(() => Promise.reject(error), ['a']),
    ).rejects.toBe(error);
  });

  test('rejects when fetchMessage throws, and leaves no other fetch unhandled', async () => {
    const error = new Error('thrown');

    await expect(
      fetchMessagesById(
        ({ message }) => {
          if (message === 'b') {
            throw error;
          }

          return Promise.reject(new Error('rejected later'));
        },
        ['a', 'b'],
      ),
    ).rejects.toBe(error);
  });

  test('rejects with any other Discord error', async () => {
    const error = discordApiError(RESTJSONErrorCodes.MissingAccess, 403);

    await expect(
      fetchMessagesById(
        ({ message }) =>
          message === 'b'
            ? Promise.reject(error)
            : Promise.resolve({ id: message }),
        ['a', 'b'],
      ),
    ).rejects.toBe(error);
  });
});

const discordApiError = (
  code: RESTJSONErrorCodes,
  status: number,
): DiscordAPIError =>
  new DiscordAPIError(
    { code, message: 'Discord API error' },
    code,
    status,
    'GET',
    '/channels/1/messages/2',
    {},
  );
