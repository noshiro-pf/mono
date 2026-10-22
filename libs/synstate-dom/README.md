# synstate-dom

A compiler-free, fine-grained UI library that binds [synstate](https://github.com/noshiro-pf/mono/tree/main/libs/synstate) observables directly to the DOM.

> [!WARNING]
> Under development and not published yet. The design is in [`SPEC.md`](./SPEC.md) (Japanese); this README grows as the implementation catches up.

## What is implemented

- `Constant<T>` and `constant(value)`: a value written once and never updated.
- `Bindable<T>`: what a slot that takes data accepts, `InitializedObservable<T> | Constant<T> | View<T>`. A plain value is a type error.
- `view(source, fn)`: an observable and a light transformation, bound without creating a node in the graph.
- `mapBindable`, `derive` and `toObservable`: helpers for a component that receives a `Bindable`. Constants stay constants and never enter the graph.
- The JSX runtime (`"jsx": "react-jsx"`, `"jsxImportSource": "synstate-dom"`): a JSX expression is a lazy `Mountable` description, and a component is called once, when it is mounted.
- `render(App, container)`: mounts `App` in a root scope and returns the function that unmounts it.
- Element props: attributes and DOM properties typed from `lib.dom.d.ts` (`Bindable<T>` of each writable primitive property), `aria-*` and `data-*`, `class` as a string or a `{ name: Bindable<boolean> }` object, `style` as a string or a per-property object, and `onClick`-style event handlers. SVG elements are created in the SVG namespace and take a fixed list of attributes.
- `If`, `MatchOptional` and `MatchResult`: mount one branch at a time in a scope of its own, rebuilt only when the condition or the tag changes.
- `For`: one row per key, each in a scope of its own; `item$` and `index$` are derived from `items`, and rows are moved as little as the longest increasing subsequence allows.
- `Portal`: mounts its children into another element, in the scope where it is written.

## Naming

The library's own props and parameters carry no `$` suffix (`cond`, `items`, `value`): they take a `Bindable`, which may be a constant or a view as well as an observable, and the type already says which. The samples name variables that hold an observable with a `$` suffix (`count$`, `item$`), as the synstate documentation does, to tell them from plain values at a glance. Nothing enforces it; whether a component's own props carry the suffix is up to its author.
