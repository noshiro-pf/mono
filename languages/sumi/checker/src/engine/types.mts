import { type ReadonlyRecord } from 'ts-type-forge';
import {
  type SourceFile,
  type Node as TsNode,
} from 'typescript-native/unstable/ast';
import { type Checker } from 'typescript-native/unstable/sync';

/**
 * What a rule is given for one node.
 *
 * `checker` is the TypeScript 7 checker, which talks to the compiler over a
 * channel: a `Type` is a handle, and every method on it is a round trip. Ask
 * it only about nodes the syntax already selected — the pass walks every node
 * of every file, and querying each one would pay for the whole program.
 */
export type RuleContext = Readonly<{
  checker: Checker;
  sourceFile: SourceFile;

  /**
   * Reports `node` under the rule's own neutral ID, naming one of the rule's
   * `messages`. `data` fills the `{{placeholder}}`s in that message.
   *
   * The ID rather than the prose so that a test can pin *which* message a
   * rule produced -- the conformance corpus compares rule IDs and lines and
   * never looks at the text.
   */
  report: (
    node: TsNode,
    messageId: string,
    data?: ReadonlyRecord<string, string>,
  ) => void;
}>;

/**
 * A rule is a neutral ID and a visitor. The pass calls `visit` once per node
 * per file, in source order, with one shared program and one shared checker.
 */
export type Rule = Readonly<{
  /**
   * The neutral rule ID, the same vocabulary the conformance corpus and the
   * oxlint preset use (`languages/sumi/conformance/src/rule-ids.mts`).
   */
  ruleId: string;
  description: string;

  /** Message templates by ID. `{{name}}` is replaced from `report`'s `data`. */
  messages: ReadonlyRecord<string, string>;
  // `Node` is TypeScript's own interface, declared mutable; this package does
  // not get to restate it.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  visit: (node: TsNode, context: RuleContext) => void;
}>;

/** One reported problem, in the shape the corpus and the CLI compare. */
export type CheckerDiagnostic = Readonly<{
  ruleId: string;

  /** Which of the rule's `messages` was reported. */
  messageId: string;
  fileName: string;

  /** 1-based, as diagnostics are conventionally shown. */
  line: number;
  column: number;
  message: string;
}>;
