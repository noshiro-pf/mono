import { keepEqualParts, map, source } from 'synstate';
import type { DeepReadonly } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test(keepEqualParts, () => {
    // embed-sample-code-ignore-above

    type Board = DeepReadonly<{
      title: string;
      cards: { id: number; text: string }[];
    }>;

    // A stream that arrives whole from outside (a WebSocket, say), each message
    // a new object even when nothing changed. A state you write yourself takes
    // `createState(initial, { keepEqualParts: true })` instead.
    const message$ = source<Board>();

    const board$ = message$.pipe(keepEqualParts());

    const firstCard$ = board$.pipe(map((board) => board.cards[0]));

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const boardHistory: Board[] = [];

    board$.subscribe((board) => {
      boardHistory.push(board);
    });

    // transformer-ignore-next-line convert-to-readonly, append-as-const
    const firstCardHistory: unknown[] = [];

    firstCard$.subscribe((card) => {
      firstCardHistory.push(card);
    });

    message$.next({ title: 'todo', cards: [{ id: 1, text: 'a' }] });

    // Equal to the last one: nothing is passed on.
    message$.next({ title: 'todo', cards: [{ id: 1, text: 'a' }] });

    assert.strictEqual(boardHistory.length, 1);

    // A card added: a new board, but the first card is the one passed on
    // before, so `firstCard$` is not told of it.
    message$.next({
      title: 'todo',
      cards: [
        { id: 1, text: 'a' },
        { id: 2, text: 'b' },
      ],
    });

    assert.strictEqual(boardHistory.length, 2);

    assert.strictEqual(boardHistory[1]?.cards[0], boardHistory[0]?.cards[0]);

    assert.strictEqual(firstCardHistory.length, 1);

    // embed-sample-code-ignore-below
  });
}
