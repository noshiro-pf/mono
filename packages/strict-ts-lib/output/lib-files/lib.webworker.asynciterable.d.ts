/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

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
