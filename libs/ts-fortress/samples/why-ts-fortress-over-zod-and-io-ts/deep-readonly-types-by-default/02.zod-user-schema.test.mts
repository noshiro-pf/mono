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

import * as z from 'zod';

const UserSchema = z.object({
  name: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
  }),
  tags: z.array(z.string()),
});

type User = z.infer<typeof UserSchema>;
// ↑ {
//     name: string;
//     address: {
//       street: string;
//       city: string;
//     };
//     tags: string[];
//   }

const user: User = UserSchema.parse(someData);

// None of these will result in a TypeScript compilation error:
user.name = 'new name';

user.address.street = 'new street';

user.tags.push('new tag');

user.tags[0] = 'modified';
