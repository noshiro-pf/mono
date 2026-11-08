---
title: Todo リスト
description: If、For、class のオブジェクト形式、ビュー専用の派生を使った Todo リストです。
---

入力欄と、項目ができると現れるリスト、残りの件数を表示します。

```tsx
import { constant, For, If, render, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';
import { Arr } from 'ts-data-forge';

type Todo = Readonly<{ id: number; title: string; done: boolean }>;

const [todos$, _setTodos, { updateState: updateTodos }] = createState<
    readonly Todo[]
>([]);

const [draft$, setDraft, { getSnapshot: getDraft }] = createState('');

const toggle = (id: number): void => {
    updateTodos((todos) =>
        todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
};

const add = (): void => {
    const title = getDraft().trim();

    if (title === '') {
        return;
    }

    // Todos are only ever appended, so the length is a unique key. `Date.now()`
    // is not: two todos added within the same millisecond would share it.
    updateTodos((todos) =>
        Arr.toPushed(todos, { id: todos.length, title, done: false }),
    );

    setDraft('');
};

// `For` keeps one row per key: a row's function runs once, and reordering
// `todos$` moves the row's nodes rather than recreating them.
const TodoApp = (): JSX.Element => {
    // A derivation only this view reads is created here, inside the component, so
    // it exists only while the view is mounted.
    const remaining$ = todos$.pipe(
        map((todos) => todos.filter((t) => !t.done).length),
    );

    return (
        <section>
            <input
                value={draft$}
                onInput={(e) => {
                    setDraft(e.currentTarget.value);
                }}
            />
            <button type={constant('button')} onClick={add}>
                {constant('Add')}
            </button>
            <If
                cond={todos$.pipe(map(Arr.isNonEmpty))}
                then={
                    <ul>
                        <For items={todos$} key={(todo) => todo.id}>
                            {(todo$, index$) => (
                                <li
                                    class={{
                                        done: todo$.pipe(
                                            map((todo) => todo.done),
                                        ),
                                    }}
                                >
                                    <label>
                                        <input
                                            type={constant('checkbox')}
                                            checked={todo$.pipe(
                                                map((todo) => todo.done),
                                            )}
                                            onChange={() => {
                                                toggle(todo$.value.id);
                                            }}
                                        />
                                        {index$.pipe(map((i) => `${i + 1}. `))}
                                        {todo$.pipe(map((todo) => todo.title))}
                                    </label>
                                </li>
                            )}
                        </For>
                    </ul>
                }
                else={<p>{constant('Nothing to do.')}</p>}
            />
            <p>{remaining$.pipe(map((n) => `${n} remaining`))}</p>
        </section>
    );
};

render(TodoApp, document.body);
```

ポイント：

- **`For` は `todo.id` ごとに 1 行を保ちます。** Todo を切り替えると新しい配列が `todos$` に書き込まれますが、行の関数がもう一度呼ばれることはありません。`For` が新しい Todo をその行の状態に書き込み、変わるのはその行の `checked` プロパティ、`done` クラス、テキストだけです。Todo が前と同じオブジェクトのほかの行は、訪れもしません。
- **`remaining$` は `TodoApp` の中で作っています。** このビューしか読まないからです。ルートの owner に属するので、アンマウント時に破棄されます。[ライフサイクルと owner](/mono/synstate-dom-next/ja/guides/lifecycle/#2-つの書き方)も見てください。
- **リストと「Nothing to do.」の段落は、どちらも `If` に渡した記述です。** 一度にマウントされるのは片方だけで、切り替えるともう片方の owner が `For` や行ごと破棄されます。
- **イベントハンドラは状態に書き込むだけ**（`setDraft`、`updateTodos`）で、Observable は作りません。
