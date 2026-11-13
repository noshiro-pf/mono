import { Result } from 'ts-data-forge';
import { newRoom } from '../functions/index.mjs';
import { convertRoomToRoomRemote } from '../types/index.mjs';
import { parseRoomDoc } from './parse-room-doc.mjs';

describe(parseRoomDoc, () => {
  const room = {
    ...newRoom(undefined, { name: 'alice', online: true }),
    id: 'a',
  } as const;

  test('reads a room back with its id', () => {
    assert.deepStrictEqual(
      parseRoomDoc('a', convertRoomToRoomRemote(room)),
      Result.ok(room),
    );
  });

  test('reads no document as no room', () => {
    assert.deepStrictEqual(parseRoomDoc('a', undefined), Result.ok(undefined));
  });

  test('says what is wrong with a document that is not a room, rather than throwing (#3285)', () => {
    const parsed = parseRoomDoc('a', { players: 'nobody' });

    assert.isTrue(Result.isErr(parsed));

    assert.include(Result.unwrapErr(parsed), 'rooms/a');
  });
});
