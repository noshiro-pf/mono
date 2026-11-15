# eslint-plugin-react-coding-style

Lint rules to recommends React component style like below:

```tsx
import * as React from 'react';

type Props = Readonly<{
    numList: readonly number[];
}>;

OK;
export const Ok = React.memo<Props>((props) => {
    const sum = React.useMemo(
        () => props.numList.reduce((a, b) => a + b, 0),
        [props.numList],
    );

    return <div>{sum}</div>;
});

// OK
export const NoReturnStatementWithDestructedProps = React.memo<Props>(
    ({ numList }) => <div>{numList.length}</div>,
);

// OK
export const NoReturnStatementWithoutDestructedProps = React.memo<Props>(
    (props) => <div>{props.numList.length}</div>,
);

// OK
export const MemoWithoutProps = React.memo(() => <div>{1}</div>);
```

[typescript-eslint PlayGround](https://typescript-eslint.io/play/#ts=5.9.3&showAST=es&fileType=.tsx&code=JYWwDg9gTgLgBAKjgQwM5wEoFNkGN4BmUEIcARFDvmQNwCwAUKJLIiugDYQAmaAFnCIlyXXqj61GjGAE8wWOAAViYdAF5MObhAB2HGQB4A3ozhwdAVxAAZYKhgAuOJWTa9M81YBGWKAG0AXXoGAF8APmDGAHoouAB5AGlGLAAPFnhcXXt4gGs4DWw8GAA6ECwQCANlCFUwgAo6sBVUAEp8sLgTBjNMnWzUK3zNIuKLVCwAWXKIOtMzODq2tQ6mmtRiyxs7EspuC1wsBuQAGjgvJY7kOABqM9OABhbjubM-VdUNq1t7AOfuuBakX%2BlBgFigOjgBm4wAAbmEjAMQCEDFFoXDgiFAVIGDF4kkGKl0nBetkAHIQbCg8EAZRgyBg5SwOhgAHVgDA%2BNSmlohoV8KVplVmvU6kZPFtspj2pC0fDNt8ShwmQBzDnI1GwsJYhjRWKJZJpaAZLLwcmUsE6Wn0xnMtkciAWGBclzcXlUEplCpCtYi96taVQzVGP2fCWKlVqlGy7W6uCkgDiBqJJPgAEEoMrUzodBA6QzXQV3QKvdVag0-U5S-7lp05im4Ii3SMxpNprN-mZFtKQ-LtsVdvtDnUTmcLigbnc4I8-vM4G9mqGFb85jHgVgqRDA3CEVZ1bKMavcQmk0biSa4OnM9nc9buKnUABJPTAHQKQsjT2VKu%2B5pOMW9%2BwnBdXR9HFHx-ACOApRrLoenPRt335FspgqdtZy7Gsey%2BPsBwOI5TnOaUrluLwHieF45ywsNl3%2BVczBBC0ZSDRE901A8gSPRMCUNVh60vLMczzLA70fZ9XztPgABU5CwbACF8JkDibflP29MtGl-YY3H0YxxQVICtBAjxNnAwIoK1aVYLPPp4AQ4YkPGFCZgojCVgXACdmEwd8NHIiJ1IqdyI7Sj3Own4ZwBIF6PXRit3hFiozYxhMQ42Jj245NzyciSHRgaT5EvKwmUceySicgBRFJc2AXAAGESEgV9mQMDS1krZoxz5EoAClqQADWKcqlTKZkOkQj021a1Qxys%2Bs7K60ZHLbFyxyohV%2By8vDhwIsdiMnacKPnNZF22GizDo5wYvBJjtwSjV0WSw80q4wlT3rJyBJvfN7yzDxxuLSpkB0GQfzWGa63gwZ-uQ5bgtcuA1pwzahxHQiaz2gKDuCo6Pg8s7IuxaKNxu%2BLd0Sh7QieuMXp440bLgD7ryEkSnw4F831KgHdI8gzXCMsDfDM8Jyw6yyIfp%2Baixh1CVu7UKww2vYttR3b-LIiLXkR8KVyiy7ibinckXJiJHtS6mT14rLpk%2B5n71Z9mJPy2SsHkygdCU-7VMKbTDH-MKSuA9wBYg8zQemsX-jmqHOel5y4dW%2BX1twlGdr8kj1cOrWYHxi6GOug27v3U3sU4i26eyS9nS0YTlImkthQaP2wyg8HI8h0hoaWmX4%2BlDzFe87bfPRtXAo1uc8Yi3Ors3WVDdYimUpL57GHrSSIHXjfN637eN%2BsXRlXq8BdGK0lkDKWuue-EWwYjuCJejhbY7Q%2BZ4az-vldT4f09HzPE9OyfdZ5xnsxMm90TaUyBEAA&eslintrc=N4KABGBEBOCuA2BTAzpAXGUEKQHYHsBaaFAF2gEsBjUxAE0OQE9dSBDAD3TAG1xsciaNHzRIAGn4CsA7JGSIkNUd0gBJALYAHUaQAiiKvDbQ2pCvlw9k%2BWNCqIAdADc28WIgC8AchJsa3gC61lqGFABmFELIjgAMjqRMoQCEPpo60KQAcmwaKFr%2BiADKoVQRUdBBElKykHnIyGwA5oiqAEqI-qRgyAAWtvB0YABGiGAU2rr0YGzIYAAGExndAFQzcx1dYOEiGmC%2BnQHzjpA1EAC%2BkrKYZ3IKSqQqGOp0iKzlQjy4uYip3psBYIFEisBJJLzedK6HL1AoOEphSJCII8YFvUiONGgxKhNKTTIGIwmMwWXAorEYimOGx2BwuNweHx%2BQHVa44eqNFqqAAqvTG31hhTAArGSymQx2%2BD2By63jAGlgyG6o32ANI3hOt0uIB11xk13kikMjzEz25RQAirA3B86DDEDwkOEMSKfGqUZQmr0XT8fAAxADCVSubLqKE5rWeAFUFGA1Y48hp8AAeAAKIi0yAAfAAKHNaDPIACUYE8WcwYEcVbA5xLFFwSs6dE1121etuOHuxqeUHNVptSLtP0diGdjld-0O6uCnu94993j9sFwNFJAalOlw6ODHagHOakagMbG8cTKfT%2BEzufzhZLZYrVccNbrDdobGbp1bkl1sn1tS7yimlAACyiAaKM0AAKIcAW4akjw%2BDDAAVsa855G6U7khmQiJGhEJnuSJjomCoQAILQE0sB5KwyCeMuryRFudCBKyob7lyzynmB%2BA9P0CBDL0bDOGMOJjMCPy0NACzeBembeMcn6yG2v67oaDw9pAoHgUI0GwQ08GIShNB4RhspAthmRMCZ3gEUCRHYuC5GUdRpDIKk9GjvW9B2SCGKiU5VHojEol-Oa3LgqmxJ5JJaivmw7wkpYO5snu4YHu0U4JtxvEDAJQkieCYDidFQjSbJyDyS2SkhtIqkASaqhaRBukkPplgIchqETu65mXjhVkTrZqL2X5jkUYFNHubgDFecxw2%2BSRiABS5wXgj4YURVFiAxXFCXmElPnEf540rZiUUxPEIXrUU4WhB04RCG8DjJWxaUcVAXFJjl-FgIJwlgKJRVbZJZWFpVikCMptUpWp3ZAZpYHNTBrXIAZnXGd1mG9aElnWUNVLHc5QVTTNTGHQ5ZEnUFi3XbdiCRaYJXQLFSrxeYiVkuTo2U0TNFnYzF0094G13aOj0roghELYTE2ufzuSC6J9p4X85UvQa7GHpAn08X0uW-flAOFcV22lfMMlgwpWrfrcf4CLDgE8jdjm4AQ7D7VYBNrZCrzvEilRc-zR3e%2BRIgAO5LiuHstXBB3zcRVJe7i3gBm48Ax21nPx6CicjY4VBp4gTiGV1C49dnlJ51SBfwEgTgFn1uODdx6u1JrGVaMYDgLDreYN5mGDlXe5bAJW1a1vMYBhxQpC9D3mVnmmhbXv3xaliPY9PhPVWQzb7Yw-VGlqL75j%2B18Px-KvUvB8nof4BHy6rpYGeo3HVKIMjse4Kk5AeIH1eF2LujH06FJxmQrkHUENc66YgsrhZuSZW723bmaPkMwqasGFD8MA%2BBwjoPDtsR%2BHsgYNGmI8OMC9sp6x%2BiqbwV8d7YChtgO2dwjSO2eAAeWAZFUgklPZ51Ej4O%2BD8o6khfqSa%2BoIP56Vft-Twv9ED-zztAoujgS4YzLljCBADa6qP7v1PGLcWI1Tbm9LWvIxKFhwXgtgYAqAbksOiOxlh2D1nrE0GYYASCkDsLgHo7swJOKImAeAEwZ5kJ4rY1wlA2DDCQFgvIQxzZXytl%2BHUts6psIas8Y%2B6IPjQHPuhAA9AAPUcMAAALAAJnEOcAAJEUwOgjvAADUTAUFiUgQkxhTAmkkRiNx3MISp1ruIt%2BedBn50AWo4B1ly5UkmSo%2BucCBoLlsqxDWZieRoPsZMLcmCRQhLeE0We31BgjDGEgBoANBJ%2BOqU%2BdcDYKCvCkiQMOlBaDrAWPY18YB1x7KcZ4ChXQspJiXpebMfdbzrwrLWAA3GAaRugKz-M3EEuYRQpSIFRY4zB5w4UQ0YXvFSB8skaSajpT%2BmcOpGRARCeZKzrKKkQOkIQJJhIAAl4p0CQEguQKCQL4H%2BvGZlRQAkAx4jPOY8UHBKlEM4gFmD6yNnfAwi4JiIAsM7GS%2BGIslqu3wO7eCudpbexGenKlsj%2BmQIxEsmZtK5laJNcRO1%2Bim4LmZVpfAfL2RbNQWMaJHS4kFVCGAbkZyhgqnim7Mw0xZjzxBZ67iyZuRZknvK%2BYPylRgGcBgcNQKRUKC9TmR8RZUlKRqIEfg5wQDnCAA&tsconfig=N4KABGBEDGD2C2AHAlgGwKYCcDyiAuysAdgM6QBcYoEEkJemy0eFYDArugDTg2RGwAqkWgALdNADW6ACYBJIjPQAPWQEFo0dCTKUO6XgF8QhoA&tokens=false)

## `display-name`

Requires React components created with `React.memo` to have a `displayName` property that matches the component name for better debugging in React DevTools. The assignment is the statement right after the declaration, in the same statement list: inside a factory function, it goes inside that function.

**Options:**

- `ignoreName` (string | string[], default: `[]`): Component names allowed to have a `displayName` different from their variable name.

**Examples:**

```typescript
// ❌ Bad
const MyComponent = React.memo(() => <div>Hello</div>);

// ✅ Good
const MyComponent = React.memo(() => <div>Hello</div>);
MyComponent.displayName = 'MyComponent';

// ✅ Good (mismatch allowed with ignoreName)
const MyComponent = React.memo(() => <div>Hello</div>);
MyComponent.displayName = 'SomeOtherName';
```

## `require-react-memo`

Requires a React component to be memoized. The other rules here describe how a
component created with `React.memo` is written, so a component that was never
memoized in the first place would otherwise pass them all.

A component passed to a function this rule knows nothing about (`memoNamed(...)`
and other higher order components, which may well memoize it) is left alone;
reported are the components bound to a name directly, and those wrapped in
`React.forwardRef` alone.

**Options:**

- `ignoreName` (string | string[], default: `[]`): Component names allowed to be
  defined without memo.

**Examples:**

```typescript
// ❌ Bad
export const MyComponent = (props: Props) => <div>{props.value}</div>;

// ❌ Bad
export function MyComponent(props: Props) {
    return <div>{props.value}</div>;
}

// ❌ Bad
export const MyComponent = React.forwardRef<HTMLDivElement, Props>(
    (props, ref) => <div ref={ref}>{props.value}</div>,
);

// ✅ Good
export const MyComponent = React.memo<Props>((props) => <div>{props.value}</div>);

// ✅ Good (memoized by a higher order component)
export const MyComponent = memoNamed<Props>('MyComponent', (props) => (
    <div>{props.value}</div>
));
```

## `require-use-memo`

Requires a value declared directly in the body of a React component or a custom
hook to be memoized, unless it is a primitive O(1) expression. Such a value is
computed again on every render: filtering or sorting a list, building an object,
an array or a function, or calling a function that may do any of these.

Allowed without memoization: literals (except regular expressions), names,
property access (`props.list.search`, `xs[i + 1]`), operators, template
literals, destructuring of these (without a default value that builds one, and
without a rest element), calls of hooks (`React.useMemo`, `useIsActive(...)`),
and calls of the functions in `allowedCalls` with such arguments. Everything
else is reported: wrap it in `React.useMemo`, `React.useCallback` for a
function, or move it out of the component when it uses neither props nor state.

Components are the functions passed to `React.memo` or `React.forwardRef`, the
first function given to a higher order component named in `componentWrappers`,
and the functions bound to a capitalized name that contain JSX or a
`React.createElement` call; hooks are the functions bound to a `use…` name. An
`async` function (a server component) is not checked, since it cannot call
hooks. Only the declarations directly in the function body are checked, because
a hook cannot be called inside a nested block, and a name starting with `_` is
left alone, since its value is not read.

The default allowed calls are taken as O(1): `String(xs)` and `xs.toString()` on
an array are not, and are not reported.

**Options:**

- `allowedCalls` (string[], default: `[]`): Functions whose call is O(1) and
  returns a primitive, in addition to `Math.*`, `Number`, `Number.*`, `String`,
  `Boolean`, `Object.is`, `*.toFixed` and `*.toString`. `"Num.*"` allows every
  `Num.x(...)`, and `"*.toISOString"` the method of that name on any value.
- `componentWrappers` (string[], default: `[]`): Higher order components, such
  as `memoNamed`, whose function arguments are components.

**Examples:**

```typescript
// ❌ Bad
export const ProductList = React.memo<Props>((props) => {
    const found = props.products.filter((p) => p.visible);

    const style = { color: props.color };

    return <ul style={style}>{found.length}</ul>;
});

// ✅ Good
export const ProductList = React.memo<Props>((props) => {
    const found = React.useMemo(
        () => props.products.filter((p) => p.visible),
        [props.products],
    );

    const style = React.useMemo(() => ({ color: props.color }), [props.color]);

    const count = found.length;

    const lastPage = Math.max(1, Math.ceil(count / props.perPage));

    return (
        <ul style={style}>
            {count}
            {lastPage}
        </ul>
    );
});
```

## `single-jsx-return`

Requires a function to have only one `return` statement when one of its returns
gives JSX (directly, in an array literal or in a conditional; a callback that
draws part of a component is one such function), and requires the same of every
component, found as `require-use-memo` finds one but including `async`
components, so that a component returning JSX held in a variable or built by
`.map` is checked too. An early return splits what the function draws into
several places, and everything written after it runs only on one branch. Branch
inside the returned expression instead. When one of the returns gives JSX,
`return null;` and `return;` count as returns too. The cases of a `switch` that
is the last statement of the function count as one return, because an exhaustive
`switch` over a union has no conditional expression to replace it.

**Options:**

- `componentWrappers` (string[], default: `[]`): Higher order components, such
  as `memoNamed`, whose function arguments are components.

**Examples:**

```typescript
// ❌ Bad
export const ProductPage = React.memo<Props>((props) => {
    if (props.product === undefined) {
        return <p>{'No product'}</p>;
    }

    return <h1>{props.product.name}</h1>;
});

// ✅ Good
export const ProductPage = React.memo<Props>((props) =>
    props.product === undefined ? (
        <p>{'No product'}</p>
    ) : (
        <h1>{props.product.name}</h1>
    ),
);
```
