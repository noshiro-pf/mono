---
title: Installation
description: Add synstate-next to a package of the repository, and its UI layer, synstate-dom-next.
---

## Install

synstate-next is not published yet. Inside the repository, a package depends on it as a workspace package:

```jsonc
{
    "dependencies": {
        "synstate-next": "workspace:*",
    },
}
```

`fromPromise`, `fromAbortablePromise` and `fromSubscribable` emit a `Result` of [ts-std-forge](https://github.com/noshiro-pf/mono/tree/main/libs/ts-std-forge), which synstate-next depends on. Add ts-std-forge to your own dependencies once your code imports `Result` to read them.

## One copy per program

A graph cannot span two copies of synstate-next: combining an observable with one from another copy throws. Keep one version of the package in your lockfile, and declare it as a peer dependency in a library that builds on it, as synstate-dom-next does.

## A UI

- **[synstate-dom-next](/mono/synstate-dom-next/)** binds observables straight to the DOM, with the same scheduler: a binding sits at the end of synstate-next's graph. It is the UI library made for synstate-next.
- React and Preact hooks, the Preact Signals bridge and the router have not been rebuilt yet. Until they are, [Using it with a UI](/mono/synstate-next/guides/using-with-a-ui/) shows the few lines any framework needs.

## The ESLint plugin

`eslint-plugin-synstate` is written for synstate. Its rules about writes made during propagation describe synstate-next too (a write from a subscriber still starts a second update), but the plugin has not been pointed at synstate-next's package name yet.
