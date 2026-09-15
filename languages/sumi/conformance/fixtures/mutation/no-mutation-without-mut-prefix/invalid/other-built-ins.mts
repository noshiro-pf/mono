// The mutators are those of the built-ins, not only of Array: a Map's upsert,
// a Date's setters, a typed array's in-place methods, and Reflect's writes.
// `Readonly<>` around the type maps the members but does not remove them, so
// it does not hide them either.
const cache = new Map<string, number>();
const stamp: Readonly<Date> = new Date(0);
const bytes: Readonly<Uint8Array> = new Uint8Array(2);
const record = { a: 1 } as const;

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
cache.getOrInsert('a', 1);

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
stamp.setFullYear(2000);

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
bytes.sort();

// @sumi-expect-error mutation/no-mutation-without-mut-prefix
Reflect.set(record, 'a', 2);

export const touched = [cache, stamp, bytes, record] as const;
