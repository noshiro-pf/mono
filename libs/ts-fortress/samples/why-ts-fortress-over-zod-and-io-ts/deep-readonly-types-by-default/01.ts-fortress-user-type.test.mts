/* eslint-disable import-x/first */

const someData = {
  name: 'name',
  address: {
    street: 'street',
    city: 'city',
  },
  tags: [],
};

// embed-sample-code-ignore-above

import * as t from 'ts-fortress';

const UserType = t.record({
  name: t.string(),
  address: t.record({
    street: t.string(),
    city: t.string(),
  }),
  tags: t.array(t.string()),
});

type User = t.TypeOf<typeof UserType>;
// ↑ Readonly<{
//     name: string;
//     address: Readonly<{
//       street: string;
//       city: string;
//     }>;
//     tags: readonly string[];
//   }>

const user: User = UserType.cast(someData);

// ❌ All of these produce TypeScript errors:
// @ts-expect-error Cannot assign to 'name' because it is read-only
user.name = 'new name';

// @ts-expect-error Cannot assign to 'street' because it is read-only
user.address.street = 'new street';

// @ts-expect-error Property 'push' does not exist on readonly array
user.tags.push('new tag');

// @ts-expect-error Index signature in type 'readonly string[]' only permits reading
user.tags[0] = 'modified';
