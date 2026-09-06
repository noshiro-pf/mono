const sealed = (target: unknown): void => {
  console.log(target);
};

// Decorator and class on one line: both diagnostics land on it regardless
// of whether an engine's class span starts at the decorator or at `class`.
// @tsubu-expect banned-syntax/no-decorator
// @tsubu-expect classes/no-class
@sealed export class Decorated {}
