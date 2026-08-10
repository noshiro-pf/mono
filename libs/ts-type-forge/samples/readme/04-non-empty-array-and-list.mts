import { type List, type NonEmptyArray } from 'ts-type-forge';
// embed-sample-code-ignore-above

type Post = Readonly<{
  title: string;
  content: string;
}>;

// A blog must have at least one post
type Blog = Readonly<{
  name: string;
  posts: NonEmptyArray<Post>; // Ensures posts array is never empty
}>;

// `NonEmptyArray<A>` is brand-based (an alias of `MinLengthArray<1, A>`), so a
// value is obtained via a runtime guard or an explicit cast rather than a plain
// array literal.
const myBlog: Blog = {
  name: 'My Tech Journey',
  posts: [
    // This array must have at least one element
    { title: 'First Post', content: 'Hello world!' },
    { title: 'Understanding TypeScript', content: '...' },
  ] as unknown as NonEmptyArray<Post>,
} as const;

// This would cause a type error:
const emptyBlog: Blog = {
  name: 'Empty Thoughts',
  // @ts-expect-error `[]` lacks the `MinLength` brand required by NonEmptyArray
  posts: [],
} as const;

const getFirstPostTitle = (posts: NonEmptyArray<Post>): string =>
  posts[0].title; // Safe to access posts[0] - guaranteed to exist

// Advanced List operations at the type level
type NumberList = readonly [1, 2, 3, 4, 5];

type FirstElement = List.Head<NumberList>; // 1

type LastElement = List.Last<NumberList>; // 5

type WithoutFirst = List.Tail<NumberList>; // readonly [2, 3, 4, 5]

type FirstThree = List.Take<3, NumberList>; // readonly [1, 2, 3]

type Reversed = List.Reverse<NumberList>; // readonly [5, 4, 3, 2, 1]

// Combine operations
type LastThreeReversed = List.Reverse<List.TakeLast<3, NumberList>>; // readonly [5, 4, 3]

// embed-sample-code-ignore-below
export {
  emptyBlog,
  getFirstPostTitle,
  myBlog,
  type FirstElement,
  type FirstThree,
  type LastElement,
  type LastThreeReversed,
  type Reversed,
  type WithoutFirst,
};
