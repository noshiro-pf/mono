import * as assert from 'node:assert/strict';
import {
  createAsyncChildObservable,
  createRootObservable,
  createState,
  createSyncChildObservable,
  map,
  source,
} from 'synstate';

const [count, setCount] = createState(1);

// `pipe` composes operators into a derived observable.
const doubled = count.pipe(map((n) => n * 2));

const mut_seen = [];

doubled.subscribe((n) => {
  mut_seen.push(n);
});

setCount(2);
setCount(3);

// The subscriber sees the current value first, then each update.
assert.deepStrictEqual(mut_seen, [2, 4, 6]);

// The snapshot is an Optional from ts-data-forge, not a bare value.
assert.deepStrictEqual(doubled.getSnapshot().value, 6);

// The authoring API: a custom creator, sync operator and async operator
// built only from what the package exports. `Optional` is ts-data-forge's,
// which this project does not declare, so an empty snapshot stands in for
// `Optional.none`.
const none = source().getSnapshot();

const hasValue = (snapshot) => 'value' in snapshot;

const mut_listeners = new Set();

const fromEmitter = () =>
  createRootObservable({ initialValue: none }, ({ startUpdate }) => {
    mut_listeners.add(startUpdate);

    return {};
  });

const emit = (value) => {
  for (const listener of mut_listeners) {
    listener(value);
  }
};

const double = (src) =>
  createSyncChildObservable(
    { parents: [src], initialValue: none },
    ({ setNext }) =>
      (updateToken) => {
        const sn = src.getSnapshot();

        if (src.updateToken === updateToken && hasValue(sn)) {
          setNext(sn.value * 2, updateToken);
        }
      },
  );

// Holds each value until `release` runs, as a timer would.
const mut_pending = [];

const deferred = (src) =>
  createAsyncChildObservable(
    { parents: [src], initialValue: none },
    ({ startUpdate }) =>
      (updateToken) => {
        const sn = src.getSnapshot();

        if (src.updateToken === updateToken && hasValue(sn)) {
          mut_pending.push(() => {
            startUpdate(sn.value);
          });
        }
      },
  );

const release = () => {
  for (const run of mut_pending.splice(0)) {
    run();
  }
};

const event$ = fromEmitter();

const mut_authored = [];

deferred(double(event$)).subscribe((n) => {
  mut_authored.push(n);
});

emit(1);

emit(2);

assert.deepStrictEqual(mut_authored, []);

release();

assert.deepStrictEqual(mut_authored, [2, 4]);

console.info('synstate ok');
