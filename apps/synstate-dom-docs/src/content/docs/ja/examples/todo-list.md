---
title: Todo リスト
description: If、For、class のオブジェクト形式、ビュー専用の派生を使った Todo リスト。
---

README の大きい方のサンプル。入力欄と、項目ができると現れるリスト、残りの件数を持つ。

```tsx
import { createState, map } from 'synstate';
import { constant, For, If, render, view, type JSX } from 'synstate-dom';
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
    // A derivation only this view reads is created here, inside the component,
    // so it exists only while the view is mounted.
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
                cond={view(todos$, Arr.isNonEmpty)}
                then={
                    <ul>
                        <For items={todos$} key={(todo) => todo.id}>
                            {(todo$, index$) => (
                                <li
                                    class={{
                                        done: view(todo$, (todo) => todo.done),
                                    }}
                                >
                                    <label>
                                        <input
                                            type={constant('checkbox')}
                                            checked={view(
                                                todo$,
                                                (todo) => todo.done,
                                            )}
                                            onChange={() => {
                                                toggle(
                                                    todo$.getSnapshot().value
                                                        .id,
                                                );
                                            }}
                                        />
                                        {view(index$, (i) => `${i + 1}. `)}
                                        {view(todo$, (todo) => todo.title)}
                                    </label>
                                </li>
                            )}
                        </For>
                    </ul>
                }
                else={<p>{constant('Nothing to do.')}</p>}
            />
            <p>{view(remaining$, (n) => `${n} remaining`)}</p>
        </section>
    );
};

render(TodoApp, document.body);
```

見どころ:

- **`For` は `todo.id` ごとに 1 行を保つ。** Todo を切り替えると新しい配列が `todos$` に書かれるが、行の関数は再び呼ばれず、その行の `checked` プロパティ、`done` クラス、テキストだけが変わる。
- **`remaining$` は `TodoApp` の中で作る。** このビューだけが読むからである。ルートスコープに属し、アンマウント時に破棄される。[ライフサイクルとスコープ](/mono/synstate-dom/ja/guides/lifecycle/#2-つの書き方)を参照。
- **リストと「Nothing to do.」の段落はどちらも `If` に渡した記述である。** 一度にマウントされるのは片方だけで、切り替えるともう片方のスコープが `For` と行ごと破棄される。
- **イベントハンドラは状態に書き込むだけ**（`setDraft`、`updateTodos`）で、Observable を作らない。
