/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

/////////////////////////////
/// WorkerGlobalScope APIs
/////////////////////////////
// These are only available in a Web Worker
declare function importScripts(...urls: readonly string[]): void;
