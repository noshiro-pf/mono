/// <reference no-default-lib="true"/>

/////////////////////////////
/// Window Async Iterable APIs
/////////////////////////////

interface FileSystemDirectoryHandle {
  [Symbol.asyncIterator](): AsyncIterableIterator<
    readonly [string, FileSystemHandle]
  >;
  entries(): AsyncIterableIterator<readonly [string, FileSystemHandle]>;
  keys(): AsyncIterableIterator<string>;
  values(): AsyncIterableIterator<FileSystemHandle>;
}

interface ReadableStream<R = unknown> {
  [Symbol.asyncIterator](
    options?: ReadableStreamIteratorOptions,
  ): AsyncIterableIterator<R>;
  values(options?: ReadableStreamIteratorOptions): AsyncIterableIterator<R>;
}
