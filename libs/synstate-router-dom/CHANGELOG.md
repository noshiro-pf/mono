# synstate-router-dom

## 0.2.0

### Minor Changes

- f66e35d: synstate-dom: `view` is renamed `inlineMap`, its type `View` `InlineMap`, and `derive` is renamed `deriveBindable`. `inlineMap(source, fn)` is an optimization of `source.pipe(map(fn))` for places with many bindings, such as the cells of `For` rows, and the new name says so; `deriveBindable` pairs with `mapBindable` and no longer shares its name with synstate's `derive`. A binding of an inline map now writes a result only when it is not `Object.is` the one it wrote last, as a `map` node passes on no such result.

    `Bindable<T>` is now `InitializedObservable<T> | Constant<T>`: an inline map is taken only by a slot of an intrinsic element (an attribute, a DOM property, a text child, a value of the `class` or `style` object), whose type is the new `ElementBindable<T>`. A component's data props (those typed `Bindable`, `If`'s `cond`, `For`'s `items` and the `Match` components' `value` included) and `mapBindable`, `deriveBindable` and `toObservable` no longer take one; a prop that a component hands to an element as it is, such as a `Child` or `Link`'s `<a>` attributes, still does.

    Breaking: replace `view` with `inlineMap`, `View` with `InlineMap`, and synstate-dom's `derive` with `deriveBindable`; where an inline map is given to a prop typed `Bindable` or to one of those helpers, write `source.pipe(map(fn))` instead. A DOM property that the page changed is no longer set back by an inline map whose result did not change; `checked` and `indeterminate` are still restored after a `change`.

    blueprint-synstate: built on the renamed API. Its props typed `Bindable` no longer accept an inline map; pass `source.pipe(map(fn))`. Its `children` still take one.

    eslint-plugin-synstate: `no-observable-in-handler` reports synstate-dom's `deriveBindable` where it reported `derive`.

    synstate-router-dom: `Link`'s `to` takes a `Bindable` and no longer an inline map; pass `source.pipe(map(fn))`.

### Patch Changes

- Updated dependencies [f66e35d]
- Updated dependencies [931ba22]
    - synstate-dom@0.9.0
    - ts-data-forge@14.13.0
    - synstate@7.0.2
    - synstate-router@0.1.0
