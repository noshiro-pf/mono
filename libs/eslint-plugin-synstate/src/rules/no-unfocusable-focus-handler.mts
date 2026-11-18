import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';

type Options = readonly [];

type MessageIds = 'unfocusable' | 'useBubbling';

/**
 * synstate-dom binds `onFocus` and `onBlur` to the DOM's `focus` and `blur`
 * events, which do not bubble, where React's `onFocus` and `onBlur` do. Code
 * ported from React that puts them on a wrapper, expecting to hear the focus of
 * what it holds, compiles and never runs. This reports `onFocus` or `onBlur` on
 * an intrinsic element that cannot take the focus itself, and suggests the
 * bubbling `onFocusIn` / `onFocusOut`.
 *
 * An element takes the focus when it is a natively focusable control (`button`,
 * `input`, `select`, `textarea`, `iframe`, `summary`, `embed`, `object`), an
 * `a` or `area` with `href`, an `audio` or `video` with `controls`, or any
 * element with `tabIndex` or `contentEditable`, in either case. An element with
 * a spread attribute is not judged, since the spread may carry any of those,
 * nor is a component (`<Tooltip>`, `<ui.Box>`), whose props are its own. Only
 * the attribute names are read, which no type wrapper can stand around, so
 * nothing is unwrapped.
 *
 * It is for synstate-dom code alone: in React, `onFocus` on a wrapper hears its
 * children, so this rule is not in the `recommended` config, only in
 * `synstate-dom`.
 */
export const noUnfocusableFocusHandler: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow `onFocus` / `onBlur`, which do not bubble in synstate-dom, on an element that cannot take the focus itself.',
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      unfocusable:
        '`{{name}}` binds the DOM `{{event}}` event, which does not bubble, and `<{{tag}}>` cannot take the focus itself, so this handler never runs unless the element is given `tabIndex`. To hear the focus of what it holds, use `{{bubbling}}`.',
      useBubbling: 'Use `{{bubbling}}`, which bubbles.',
    },
    defaultOptions: [],
  },

  create: (context) => ({
    JSXOpeningElement: (node) => {
      if (
        node.name.type !== AST_NODE_TYPES.JSXIdentifier ||
        !/^[a-z]/u.test(node.name.name)
      ) {
        return;
      }

      const tag = node.name.name;

      const attributes = node.attributes;

      if (
        attributes.some(
          (attribute) => attribute.type === AST_NODE_TYPES.JSXSpreadAttribute,
        )
      ) {
        return;
      }

      const names: ReadonlySet<string> = new Set<string>(
        attributes.flatMap((attribute) =>
          attribute.type === AST_NODE_TYPES.JSXAttribute &&
          attribute.name.type === AST_NODE_TYPES.JSXIdentifier
            ? [attribute.name.name]
            : [],
        ),
      );

      if (isFocusable(tag, names)) {
        return;
      }

      for (const attribute of attributes) {
        if (
          attribute.type !== AST_NODE_TYPES.JSXAttribute ||
          attribute.name.type !== AST_NODE_TYPES.JSXIdentifier
        ) {
          continue;
        }

        const name = attribute.name.name;

        const handler = nonBubbling.get(name);

        if (handler === undefined) {
          continue;
        }

        const nameNode: TSESTree.JSXIdentifier = attribute.name;

        context.report({
          node: nameNode,
          messageId: 'unfocusable',
          data: { name, event: handler.event, tag, bubbling: handler.bubbling },
          suggest: [
            {
              messageId: 'useBubbling',
              data: { bubbling: handler.bubbling },
              fix: (fixer) => fixer.replaceText(nameNode, handler.bubbling),
            },
          ],
        });
      }
    },
  }),
} as const;

/** The handlers bound to a non-bubbling event, each with its bubbling twin. */
const nonBubbling: ReadonlyMap<
  string,
  Readonly<{ event: string; bubbling: string }>
> = new Map<string, Readonly<{ event: string; bubbling: string }>>([
  ['onFocus', { event: 'focus', bubbling: 'onFocusIn' }],
  ['onBlur', { event: 'blur', bubbling: 'onFocusOut' }],
]);

/** The tags that take the focus with no attribute. */
const nativelyFocusable: ReadonlySet<string> = new Set<string>([
  'button',
  'embed',
  'iframe',
  'input',
  'object',
  'select',
  'summary',
  'textarea',
]);

/** Whether `<tag>` with attributes named `names` can take the focus. */
const isFocusable = (tag: string, names: ReadonlySet<string>): boolean =>
  nativelyFocusable.has(tag) ||
  ((tag === 'a' || tag === 'area') && names.has('href')) ||
  ((tag === 'audio' || tag === 'video') && names.has('controls')) ||
  names.has('tabIndex') ||
  names.has('tabindex') ||
  names.has('contentEditable') ||
  names.has('contenteditable');
