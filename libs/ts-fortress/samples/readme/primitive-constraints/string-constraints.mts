import * as t from 'ts-fortress';

const Slug = t.string('feature-flag', {
  startsWith: 'feature',
  includes: '-',
  endsWith: 'flag',
  nonempty: true,
  minLength: 6,
  maxLength: 32,
  regex: /^[a-z-]+$/u,
});

Slug.is('feature-beta'); // true
Slug.is('Feature-Flag'); // false (fails regex)

type SlugType = t.TypeOf<typeof Slug>; // inferred as `feature${string}`

// embed-sample-code-ignore-below
export { type SlugType };
