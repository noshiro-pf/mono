import { register } from 'node:module';

// These check projects live inside the monorepo, so Node's resolution walks up
// past them into the repository's own `node_modules` — where every package the
// root declares is present, our own libraries among them, linked to their
// source. A package that forgot to declare a dependency would find it there and
// the check would pass.
//
// Measured, not assumed: with `cmd-ts` moved out of ts-codemod-cli's
// dependencies, `import { Arr } from 'ts-data-forge'` inside a project that
// declares only ts-fortress resolved to
// `<repo>/libs/ts-data-forge/dist/entry-point.mjs`.
//
// The hook below refuses anything resolving outside the space, so the boundary
// is enforced rather than hoped for.
register(new URL('./isolate-hooks.mjs', import.meta.url));
