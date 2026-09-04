import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';

type Options = readonly [];

type MessageIds = 'preferDedent';

/**
 * Every character ECMAScript treats as a line terminator inside a template
 * literal. `TemplateElement.value.raw` is the source text, so an escape
 * sequence written `\n` appears in it as a backslash followed by `n` and does
 * not match — only a real line break does, which is the whole point.
 */
const LINE_TERMINATOR = /[\n\r\u{2028}\u{2029}]/u;

/**
 * Require a string that spans lines to be a tagged template — `` dedent`...` ``
 * — rather than a bare multi-line template literal.
 *
 * ## Why
 *
 * A template literal keeps every character between its backticks, indentation
 * included. So a multi-line one has to choose between two bad options:
 *
 * ```ts
 * // (a) correct value, indentation broken
 * const usage = `usage:
 *   cmd --flag`;
 *
 * // (b) indentation intact, three spaces of it now inside the value
 * const usage2 = `usage:
 *       cmd --flag`;
 * ```
 *
 * (a) is what most of these end up as, and it is the reason a multi-line string
 * drags the eye out of the surrounding block. (b) is worse: the value silently
 * depends on how deeply the expression happens to be nested, so re-indenting
 * the code around it — extracting a function, wrapping it in an `if` — changes
 * the string. Neither is visible at the point of use.
 *
 * `dedent` removes the common indentation at runtime, so the source can be laid
 * out with the code around it and the value stops depending on where the
 * expression sits:
 *
 * ```ts
 * const usage3 = dedent`
 *     usage:
 *       cmd --flag
 * `;
 * ```
 *
 * Building the string from an array (`[...].join('\n')`) has the same property
 * and is not reported either — it is a list of lines rather than a string that
 * spans them.
 *
 * ## What is not reported
 *
 * - **Any tagged template.** The tag decides what the whitespace in its own
 *   template means, and this rule cannot know: `dedent` strips the indentation,
 *   `String.raw` keeps it deliberately, and a `gql` or `sql` tag hands the text
 *   to a parser that does not care. Reporting a tagged template would be
 *   guessing at that.
 * - **A template whose line breaks are all escapes.** `` `a\nb` `` is one
 *   source line and carries no indentation, so there is nothing to fix.
 * - **Substitutions.** `dedent` handles them, so a multi-line template with
 *   `${...}` in it is reported like any other.
 */
export const preferDedent: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require a string that spans source lines to be a tagged template (e.g. `` dedent`...` ``) rather than a bare multi-line template literal, whose value carries whatever indentation the source happens to have',
    },
    schema: [],
    messages: {
      preferDedent:
        'This template literal spans source lines, so its value carries whatever indentation the source has and changes if the surrounding code is re-indented. Tag it with `dedent` and indent it with the code around it, or build the string from an array of lines with `.join(...)`.',
    },
  },

  create: (context) => ({
    TemplateLiteral: (node) => {
      // The quasi of a tagged template — `` tag`...` `` — is a `TemplateLiteral`
      // whose parent is the `TaggedTemplateExpression`. That is the shape this
      // rule asks for, so it is also the shape it must not report.
      if (node.parent.type === AST_NODE_TYPES.TaggedTemplateExpression) return;

      if (
        node.quasis.every((quasi) => !LINE_TERMINATOR.test(quasi.value.raw))
      ) {
        return;
      }

      context.report({ node, messageId: 'preferDedent' });
    },
  }),
  defaultOptions: [],
} as const;
