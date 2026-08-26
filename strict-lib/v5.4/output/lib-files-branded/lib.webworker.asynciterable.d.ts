/// <reference no-default-lib="true"/>

/////////////////////////////
/// Worker Async Iterable APIs
/////////////////////////////

interface FileSystemDirectoryHandle {
  [Symbol.asyncIterator](): AsyncIterableIterator<
    readonly [string, FileSystemHandle]
  >;
  entries(): AsyncIterableIterator<readonly [string, FileSystemHandle]>;
  keys(): AsyncIterableIterator<string>;
  values(): AsyncIterableIterator<FileSystemHandle>;
}
