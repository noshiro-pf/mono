const sealed = (target: unknown): void => {
  console.log(target);
};

// Decorator and class on one line: both diagnostics land on it regardless
// of whether an engine's class span starts at the decorator or at `class`.
// @sumi-expect-error banned-syntax/no-decorator
// @sumi-expect-error classes/no-class
@sealed export class Decorated {}
