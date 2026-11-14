/**
 * Whether a lib file is a stub: TypeScript 6.0 turned several lib files
 * (`lib.dom.iterable.d.ts`, `lib.dom.asynciterable.d.ts`, and their WebWorker
 * counterparts) into stubs whose real declarations were folded into the main
 * `lib.dom.d.ts` / `lib.webworker.d.ts`. Such a stub carries
 * {@link stubFileMarker} in place of the declarations the per-file transforms
 * expect.
 */
export const isStubFile = (content: string): boolean =>
  content.includes(stubFileMarker);

const stubFileMarker = 'contents are now included in the main types file';
