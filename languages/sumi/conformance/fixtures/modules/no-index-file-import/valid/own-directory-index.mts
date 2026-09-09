// A file that is not part of its own directory's index may re-export it:
// `./index.mjs` names no directory because there is none to name from the
// inside, and nothing here is reachable through that index, so it is not a
// cycle. This is the shape every package entry point has.
export * from './index.mjs';
