/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

/////////////////////////////
/// Worker Async Iterable APIs
/////////////////////////////

interface FileSystemDirectoryHandleAsyncIterator<T>
  extends AsyncIteratorObject<T, BuiltinIteratorReturn, unknown> {
  [Symbol.asyncIterator](): FileSystemDirectoryHandleAsyncIterator<T>;
}

interface FileSystemDirectoryHandle {
  [Symbol.asyncIterator](): FileSystemDirectoryHandleAsyncIterator<
    readonly [string, FileSystemHandle]
  >;
  entries(): FileSystemDirectoryHandleAsyncIterator<
    readonly [string, FileSystemHandle]
  >;
  keys(): FileSystemDirectoryHandleAsyncIterator<string>;
  values(): FileSystemDirectoryHandleAsyncIterator<FileSystemHandle>;
}

interface ReadableStreamAsyncIterator<T>
  extends AsyncIteratorObject<T, BuiltinIteratorReturn, unknown> {
  [Symbol.asyncIterator](): ReadableStreamAsyncIterator<T>;
}

interface ReadableStream<R = unknown> {
  [Symbol.asyncIterator](
    options?: ReadableStreamIteratorOptions,
  ): ReadableStreamAsyncIterator<R>;
  values(
    options?: ReadableStreamIteratorOptions,
  ): ReadableStreamAsyncIterator<R>;
}
