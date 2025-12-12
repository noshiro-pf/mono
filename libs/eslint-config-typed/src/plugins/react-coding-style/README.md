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

Requires React components created with `React.memo` to have a `displayName` property that matches the component name for better debugging in React DevTools.

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
