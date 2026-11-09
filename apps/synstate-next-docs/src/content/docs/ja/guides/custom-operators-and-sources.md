---
title: 独自のオペレーターとソース
description: createDerived でオペレーターを、createSource でソースを書く。パッケージのオペレーターやソースと同じクラスの上に作られます。
---

オペレーターは、Observable から Observable への関数です。パッケージのオペレーターで表せないことがあれば、`createDerived` で好きな親を追いかけるノードを、`createSource` で自分から値を流すノードを作れます。どちらもパッケージのオペレーターと同じ種類のノードを作るので、自作のものも同じ順序、同じ規則で更新に加わります。

## 同期のオペレーター

`createDerived(parents, setup)` は作成時に `setup` を 1 回実行します。`setup` が返す `update` は、親が値を流した更新のたびに呼ばれます。`update` は親を読み、`ctx.set(value)` を呼べばこの更新で値を伝えます。呼ばなければ何も伝えません。

```tsx
import {
    createDerived,
    createState,
    type DropInitialValueOperator,
    type Observable,
} from 'synstate-next';

// Passes on the values that are not `undefined`.
const defined =
    <A,>(): DropInitialValueOperator<A | undefined, A> =>
    (source: Observable<A | undefined>): Observable<A> =>
        createDerived<A>([source], (ctx) => () => {
            const value = source.getSnapshot();

            if (value !== undefined) {
                ctx.set(value);
            }
        });

const [selected, setSelected] = createState<string | undefined>(undefined);

const lastSelected = selected.pipe(defined());

assert.isFalse(lastSelected.hasValue);

setSelected('a');

setSelected(undefined);

assert.strictEqual(lastSelected.getSnapshot(), 'a');
```

`{ initialValue }` を渡さない限り、ノードは最初に set されるまで何も持ちません。オペレーターを `DropInitialValueOperator<A, B>`（あるいは `KeepInitialValueOperator`・`ProvideInitialValueOperator`）と型付けすれば、結果が値を持つかどうかを `pipe` に伝えられます。後の 2 つは `InitializedObservable` を返す型なので、何も持たないことがあるノードをそう型付けするには `{ initialValue }` が要ります。`pipe` は `KeepInitialValueOperator` を、まだ値を持たない Observable にも適用するので、その本体はソースが値を持っていることを当てにしてはいけません。ここで作るノードは、最初に持つべき値を知ることもできません。`KeepInitialValueOperator` は値を保つオペレーターをつなぎ、その型を付けた関数として書き（`const k: KeepInitialValueOperator<A, B> = (o) => o.pipe(map(f)).pipe(debounce(ms))`。`pipe` の中にそのまま書くと、オペレーターは `Observable` を受け取り、結果も `Observable` になります）、`createDerived` で作るものは `DropInitialValueOperator` と型付けしてください。また直接呼ぶと `InitializedObservable` しか受け取らないので、`map(f)(source)` ではなく `source.pipe(map(f))` と書きます。

## 複数の親

複数の親を持つノードは、どの親が値を流しても計算し直されます。この更新でどの親が流したかは `ctx.emitted(parent)` でわかります。

```tsx
import {
    createDerived,
    createValueEmitter,
    type Observable,
} from 'synstate-next';

type Tagged<A, B> = Readonly<
    { from: 'left'; value: A } | { from: 'right'; value: B }
>;

// Like `merge`, but says which parent the value came from.
const mergeTagged = <A, B>(
    first: Observable<A>,
    second: Observable<B>,
): Observable<Tagged<A, B>> =>
    createDerived<Tagged<A, B>>([first, second], (ctx) => () => {
        const a = first.getSnapshot();

        const b = second.getSnapshot();

        // `emitted` tells which parent emitted in this update.
        if (a !== undefined && ctx.emitted(first)) {
            ctx.set({ from: 'left', value: a });
        } else if (b !== undefined && ctx.emitted(second)) {
            ctx.set({ from: 'right', value: b });
        }
    });

const [left, emitLeft] = createValueEmitter<number>();

const [right, emitRight] = createValueEmitter<string>();

const mut_seen: Tagged<number, string>[] = [];

mergeTagged(left, right).subscribe((tagged) => {
    mut_seen.push(tagged);
});

emitLeft(1);

emitRight('a');

assert.deepStrictEqual(mut_seen, [
    { from: 'left', value: 1 },
    { from: 'right', value: 'a' },
]);
```

## 非同期のオペレーター

ノードを計算し直させた更新より後に来る値は、`ctx.emit(value)` で、それ自身の更新として伝えます。そういうオペレーターは `settled` も用意して、まだ値が残っているのに終わったとみなされないようにします。`mergeMap` は、settled になった内側の Observable を手放します。止めるべきものは `ctx.onCleanup` で登録します。

```tsx
import {
    createDerived,
    source,
    type DropInitialValueOperator,
    type Observable,
} from 'synstate-next';

// Passes each value on `milliseconds` later, in an update of its own.
const delay =
    <A,>(milliseconds: number): DropInitialValueOperator<A, A> =>
    (parent: Observable<A>): Observable<A> =>
        createDerived<A>([parent], (ctx) => {
            const mut_timers = new Set<ReturnType<typeof setTimeout>>();

            ctx.onCleanup(() => {
                for (const id of mut_timers) {
                    clearTimeout(id);
                }
            });

            return {
                update: () => {
                    const value = parent.getSnapshot();

                    if (value === undefined || !ctx.emitted(parent)) {
                        return;
                    }

                    const id = setTimeout(() => {
                        mut_timers.delete(id);

                        ctx.emit(value);
                    }, milliseconds);

                    mut_timers.add(id);
                },
                // Not done while a value is still due.
                settled: () => ctx.settled(parent) && mut_timers.size === 0,
            };
        });

const messages = source<string>();

const delayed = messages.pipe(delay(100));

const mut_seen: string[] = [];

delayed.subscribe((m) => {
    mut_seen.push(m);
});

messages.emit('a');

messages.emit('b');

assert.deepStrictEqual(mut_seen, []);

await vi.advanceTimersByTimeAsync(100);

assert.deepStrictEqual(mut_seen, ['a', 'b']);
```

`setup` はノードを実行中の owner として動きます。そこで作ったものと登録したクリーンアップはノードに属し、ノードを破棄すると、クリーンアップを新しいものから実行してから、作ったものを破棄します。

## ソース

`createSource(setup)` は、他のライブラリやイベントから自分で値を流すソースを作ります。`ctx.emit` は値をそれ自身の更新として伝え、`ctx.end()` はもう値を流さないことを示し、`ctx.onCleanup` は破棄で元に戻すものを登録します。

```tsx
import { createRootOwner, createSource, type Observable } from 'synstate-next';

const fromEvent = (target: EventTarget, type: string): Observable<Event> =>
    createSource<Event>((ctx) => {
        const listener = (event: Event): void => {
            ctx.emit(event);
        };

        target.addEventListener(type, listener);

        // Runs when the source is disposed, with its owner or by itself.
        ctx.onCleanup(() => {
            target.removeEventListener(type, listener);
        });
    });

const button = new EventTarget();

const owner = createRootOwner();

const mut_types: string[] = [];

owner.run(() => {
    fromEvent(button, 'click').subscribe((event) => {
        mut_types.push(event.type);
    });
});

button.dispatchEvent(new Event('click'));

owner.dispose();

// The listener was removed.
button.dispatchEvent(new Event('click'));

assert.deepStrictEqual(mut_types, ['click']);
```

## できないこと

- **`update` から親でない Observable を読むこと。** ノードは親の下に置かれるので、親の値は新しくなった後に読めます。それ以外の Observable は、この更新でまだ計算し直されていないかもしれません。親にして、この更新でどの親が値を流したかを `ctx.emitted` で確かめてください。
- **`update` の中でノードを作ること。** `update` は更新の中で、どの owner の外でも動くので、そこで作ったノードはどの owner にも属しません。破棄されることがなく、親につながったまま、それ以降は親と一緒に計算され続けます。ノードに必要なものは `setup` で作ってください。
- **自分で作ったノードを追いかけること。** `setup` で作ったノードは親ではありません。このノードと同じ更新で、先にではなく辿られるので、`update` はその値を更新の前のまま読んでしまいます。`setup` で作るものは、購読やリスナーのような脇の仕事のためのものです。自分で作った Observable を追いかけるオペレーターは `switchMap` か `mergeMap` です。
- **synstate-next の 2 つのコピーの Observable を組み合わせること。** 別のコピーの親を渡すと `createDerived` は例外を投げます。
