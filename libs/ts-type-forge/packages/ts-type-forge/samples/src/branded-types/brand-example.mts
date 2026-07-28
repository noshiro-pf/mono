import { type Brand } from 'ts-type-forge';

// embed-sample-code-ignore-above

// Create distinct ID types
type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;

// These are incompatible even though both are strings
const userId: UserId = 'user123' as UserId;
const postId: PostId = 'post456' as PostId;
// const wrongAssignment: UserId = postId; // Error!

// Create validated types
type NonZeroInt = Brand<number, 'integer', 'zero'>;

// embed-sample-code-ignore-below
export { postId, userId };
export type { NonZeroInt, PostId, UserId };
