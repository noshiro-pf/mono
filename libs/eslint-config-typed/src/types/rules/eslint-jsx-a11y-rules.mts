/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Enforce emojis are wrapped in `<span>` and provide screen reader access.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/accessible-emoji.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace AccessibleEmoji {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce all elements that require alternative text have meaningful
 * information to relay back to end user.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/alt-text.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace AltText {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "elements": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "img": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "object": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "area": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "input[type=\"image\"]": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    elements?: readonly string[];
    img?: readonly string[];
    object?: readonly string[];
    area?: readonly string[];
    'input[type="image"]'?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce `<a>` text to not exactly match "click here", "here", "link", or "a
 * link".
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/anchor-ambiguous-text.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace AnchorAmbiguousText {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "words": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    words?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce all anchors to contain accessible content.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/anchor-has-content.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace AnchorHasContent {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "components": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    components?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce all anchors are valid, navigable elements.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/anchor-is-valid.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace AnchorIsValid {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "components": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "specialLink": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "aspects": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "enum": [
   *             "noHref",
   *             "invalidHref",
   *             "preferButton"
   *           ]
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false,
   *         "minItems": 1
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    components?: readonly string[];
    specialLink?: readonly string[];
    /** @minItems 1 */
    aspects?: readonly [
      'noHref' | 'invalidHref' | 'preferButton',
      ...('noHref' | 'invalidHref' | 'preferButton')[],
    ];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce elements with aria-activedescendant are tabbable.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/aria-activedescendant-has-tabindex.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace AriaActivedescendantHasTabindex {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce all `aria-*` props are valid.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/aria-props.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace AriaProps {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce ARIA state and property values are valid.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/aria-proptypes.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace AriaProptypes {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that elements with ARIA roles must use a valid, non-abstract ARIA
 * role.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/aria-role.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace AriaRole {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowedInvalidRoles": {
   *         "items": {
   *           "type": "string"
   *         },
   *         "type": "array",
   *         "uniqueItems": true
   *       },
   *       "ignoreNonDOM": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowedInvalidRoles?: readonly string[];
    /** @default false */
    ignoreNonDOM?: boolean;
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that elements that do not support ARIA roles, states, and properties
 * do not have those attributes.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/aria-unsupported-elements.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace AriaUnsupportedElements {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that autocomplete attributes are used correctly.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/autocomplete-valid.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace AutocompleteValid {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "inputComponents": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    inputComponents?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce a clickable non-interactive element has at least one keyboard event
 * listener.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/click-events-have-key-events.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace ClickEventsHaveKeyEvents {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that a control (an interactive element) has a text label.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/control-has-associated-label.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace ControlHasAssociatedLabel {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "labelAttributes": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "controlComponents": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "ignoreElements": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "ignoreRoles": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "depth": {
   *         "description": "JSX tree depth limit to check for accessible label",
   *         "type": "integer",
   *         "minimum": 0
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    labelAttributes?: readonly string[];
    controlComponents?: readonly string[];
    ignoreElements?: readonly string[];
    ignoreRoles?: readonly string[];
    /** JSX tree depth limit to check for accessible label */
    depth?: number;
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce heading (`h1`, `h2`, etc) elements contain accessible content.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/heading-has-content.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace HeadingHasContent {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "components": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    components?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce `<html>` element has `lang` prop.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/html-has-lang.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace HtmlHasLang {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce iframe elements have a title attribute.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/iframe-has-title.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace IframeHasTitle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce `<img>` alt prop does not contain the word "image", "picture", or
 * "photo".
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/img-redundant-alt.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace ImgRedundantAlt {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "components": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "words": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    components?: readonly string[];
    words?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that elements with interactive handlers like `onClick` must be
 * focusable.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/interactive-supports-focus.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace InteractiveSupportsFocus {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "tabbable": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "enum": [
   *             "button",
   *             "checkbox",
   *             "columnheader",
   *             "combobox",
   *             "grid",
   *             "gridcell",
   *             "link",
   *             "listbox",
   *             "menu",
   *             "menubar",
   *             "menuitem",
   *             "menuitemcheckbox",
   *             "menuitemradio",
   *             "option",
   *             "progressbar",
   *             "radio",
   *             "radiogroup",
   *             "row",
   *             "rowheader",
   *             "scrollbar",
   *             "searchbox",
   *             "slider",
   *             "spinbutton",
   *             "switch",
   *             "tab",
   *             "tablist",
   *             "textbox",
   *             "tree",
   *             "treegrid",
   *             "treeitem",
   *             "doc-backlink",
   *             "doc-biblioref",
   *             "doc-glossref",
   *             "doc-noteref"
   *           ]
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false,
   *         "minItems": 0
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** @minItems 0 */
    tabbable?: readonly (
      | 'button'
      | 'checkbox'
      | 'columnheader'
      | 'combobox'
      | 'grid'
      | 'gridcell'
      | 'link'
      | 'listbox'
      | 'menu'
      | 'menubar'
      | 'menuitem'
      | 'menuitemcheckbox'
      | 'menuitemradio'
      | 'option'
      | 'progressbar'
      | 'radio'
      | 'radiogroup'
      | 'row'
      | 'rowheader'
      | 'scrollbar'
      | 'searchbox'
      | 'slider'
      | 'spinbutton'
      | 'switch'
      | 'tab'
      | 'tablist'
      | 'textbox'
      | 'tree'
      | 'treegrid'
      | 'treeitem'
      | 'doc-backlink'
      | 'doc-biblioref'
      | 'doc-glossref'
      | 'doc-noteref'
    )[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that a `label` tag has a text label and an associated control.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/label-has-associated-control.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace LabelHasAssociatedControl {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "labelComponents": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "labelAttributes": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "controlComponents": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "assert": {
   *         "description": "Assert that the label has htmlFor, a nested label, both or either",
   *         "type": "string",
   *         "enum": [
   *           "htmlFor",
   *           "nesting",
   *           "both",
   *           "either"
   *         ]
   *       },
   *       "depth": {
   *         "description": "JSX tree depth limit to check for accessible label",
   *         "type": "integer",
   *         "minimum": 0
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    labelComponents?: readonly string[];
    labelAttributes?: readonly string[];
    controlComponents?: readonly string[];
    /** Assert that the label has htmlFor, a nested label, both or either */
    assert?: 'htmlFor' | 'nesting' | 'both' | 'either';
    /** JSX tree depth limit to check for accessible label */
    depth?: number;
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that `<label>` elements have the `htmlFor` prop.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/label-has-for.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace LabelHasFor {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "components": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "required": {
   *         "oneOf": [
   *           {
   *             "type": "string",
   *             "enum": [
   *               "nesting",
   *               "id"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "some": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "nesting",
   *                     "id"
   *                   ]
   *                 },
   *                 "uniqueItems": true,
   *                 "additionalItems": false,
   *                 "minItems": 0
   *               }
   *             },
   *             "required": [
   *               "some"
   *             ]
   *           },
   *           {
   *             "type": "object",
   *             "properties": {
   *               "every": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string",
   *                   "enum": [
   *                     "nesting",
   *                     "id"
   *                   ]
   *                 },
   *                 "uniqueItems": true,
   *                 "additionalItems": false,
   *                 "minItems": 0
   *               }
   *             },
   *             "required": [
   *               "every"
   *             ]
   *           }
   *         ]
   *       },
   *       "allowChildren": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce lang attribute has a valid value.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/lang.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace Lang {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforces that `<audio>` and `<video>` elements must have a `<track>` for
 * captions.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/media-has-caption.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace MediaHasCaption {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "audio": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "video": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       },
   *       "track": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    audio?: readonly string[];
    video?: readonly string[];
    track?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that `onMouseOver`/`onMouseOut` are accompanied by `onFocus`/`onBlur`
 * for keyboard-only users.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/mouse-events-have-key-events.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace MouseEventsHaveKeyEvents {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "hoverInHandlers": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false,
   *         "description": "An array of events that need to be accompanied by `onFocus`"
   *       },
   *       "hoverOutHandlers": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false,
   *         "description": "An array of events that need to be accompanied by `onBlur`"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** An array of events that need to be accompanied by `onFocus` */
    hoverInHandlers?: readonly string[];
    /** An array of events that need to be accompanied by `onBlur` */
    hoverOutHandlers?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that the `accessKey` prop is not used on any element to avoid
 * complications with keyboard commands used by a screen reader.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-access-key.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace NoAccessKey {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Disallow `aria-hidden="true"` from being set on focusable elements.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-aria-hidden-on-focusable.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace NoAriaHiddenOnFocusable {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce autoFocus prop is not used.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-autofocus.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace NoAutofocus {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreNonDOM": {
   *         "type": "boolean",
   *         "default": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** @default false */
    ignoreNonDOM?: boolean;
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce distracting elements are not used.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-distracting-elements.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace NoDistractingElements {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "elements": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "enum": [
   *             "marquee",
   *             "blink"
   *           ]
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false,
   *         "minItems": 0
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** @minItems 0 */
    elements?: readonly ('marquee' | 'blink')[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Interactive elements should not be assigned non-interactive roles.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-interactive-element-to-noninteractive-role.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace NoInteractiveElementToNoninteractiveRole {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": {
   *       "type": "array",
   *       "items": {
   *         "type": "string"
   *       },
   *       "uniqueItems": true
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<Record<string, readonly string[]>>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Non-interactive elements should not be assigned mouse or keyboard event
 * listeners.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-noninteractive-element-interactions.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace NoNoninteractiveElementInteractions {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "handlers": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    handlers?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Non-interactive elements should not be assigned interactive roles.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-noninteractive-element-to-interactive-role.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace NoNoninteractiveElementToInteractiveRole {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": {
   *       "type": "array",
   *       "items": {
   *         "type": "string"
   *       },
   *       "uniqueItems": true
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<Record<string, readonly string[]>>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * `tabIndex` should only be declared on interactive elements.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-noninteractive-tabindex.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace NoNoninteractiveTabindex {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "roles": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false,
   *         "description": "An array of ARIA roles"
   *       },
   *       "tags": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false,
   *         "description": "An array of HTML tag names"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** An array of ARIA roles */
    roles?: readonly string[];
    /** An array of HTML tag names */
    tags?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce usage of `onBlur` over `onChange` on select menus for accessibility.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-onchange.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | true  |
 *  ```
 */
namespace NoOnchange {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * Enforce explicit role property is not the same as implicit/default role
 * property on element.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-redundant-roles.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace NoRedundantRoles {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": {
   *       "type": "array",
   *       "items": {
   *         "type": "string"
   *       },
   *       "uniqueItems": true
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<Record<string, readonly string[]>>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that non-interactive, visible elements (such as `<div>`) that have
 * click handlers use the role attribute.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/no-static-element-interactions.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace NoStaticElementInteractions {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "handlers": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true,
   *         "additionalItems": false
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    handlers?: readonly string[];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforces using semantic DOM elements over the ARIA `role` property.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/prefer-tag-over-role.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace PreferTagOverRole {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that elements with ARIA roles must have all required attributes for
 * that role.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/role-has-required-aria-props.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace RoleHasRequiredAriaProps {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce that elements with explicit or implicit roles defined contain only
 * `aria-*` properties supported by that `role`.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/role-supports-aria-props.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace RoleSupportsAriaProps {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce `scope` prop is only used on `<th>` elements.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/scope.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace Scope {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * Enforce `tabIndex` value is not greater than zero.
 *
 * @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/tree/HEAD/docs/rules/tabindex-no-positive.md
 *
 *  ```md
 *  | key        | value |
 *  | :--------- | :---- |
 *  | deprecated | false |
 *  ```
 */
namespace TabindexNoPositive {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {}
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintJsxA11yRules = Readonly<{
  'jsx-a11y/alt-text': AltText.RuleEntry;
  'jsx-a11y/anchor-ambiguous-text': AnchorAmbiguousText.RuleEntry;
  'jsx-a11y/anchor-has-content': AnchorHasContent.RuleEntry;
  'jsx-a11y/anchor-is-valid': AnchorIsValid.RuleEntry;
  'jsx-a11y/aria-activedescendant-has-tabindex': AriaActivedescendantHasTabindex.RuleEntry;
  'jsx-a11y/aria-props': AriaProps.RuleEntry;
  'jsx-a11y/aria-proptypes': AriaProptypes.RuleEntry;
  'jsx-a11y/aria-role': AriaRole.RuleEntry;
  'jsx-a11y/aria-unsupported-elements': AriaUnsupportedElements.RuleEntry;
  'jsx-a11y/autocomplete-valid': AutocompleteValid.RuleEntry;
  'jsx-a11y/click-events-have-key-events': ClickEventsHaveKeyEvents.RuleEntry;
  'jsx-a11y/control-has-associated-label': ControlHasAssociatedLabel.RuleEntry;
  'jsx-a11y/heading-has-content': HeadingHasContent.RuleEntry;
  'jsx-a11y/html-has-lang': HtmlHasLang.RuleEntry;
  'jsx-a11y/iframe-has-title': IframeHasTitle.RuleEntry;
  'jsx-a11y/img-redundant-alt': ImgRedundantAlt.RuleEntry;
  'jsx-a11y/interactive-supports-focus': InteractiveSupportsFocus.RuleEntry;
  'jsx-a11y/label-has-associated-control': LabelHasAssociatedControl.RuleEntry;
  'jsx-a11y/lang': Lang.RuleEntry;
  'jsx-a11y/media-has-caption': MediaHasCaption.RuleEntry;
  'jsx-a11y/mouse-events-have-key-events': MouseEventsHaveKeyEvents.RuleEntry;
  'jsx-a11y/no-access-key': NoAccessKey.RuleEntry;
  'jsx-a11y/no-aria-hidden-on-focusable': NoAriaHiddenOnFocusable.RuleEntry;
  'jsx-a11y/no-autofocus': NoAutofocus.RuleEntry;
  'jsx-a11y/no-distracting-elements': NoDistractingElements.RuleEntry;
  'jsx-a11y/no-interactive-element-to-noninteractive-role': NoInteractiveElementToNoninteractiveRole.RuleEntry;
  'jsx-a11y/no-noninteractive-element-interactions': NoNoninteractiveElementInteractions.RuleEntry;
  'jsx-a11y/no-noninteractive-element-to-interactive-role': NoNoninteractiveElementToInteractiveRole.RuleEntry;
  'jsx-a11y/no-noninteractive-tabindex': NoNoninteractiveTabindex.RuleEntry;
  'jsx-a11y/no-redundant-roles': NoRedundantRoles.RuleEntry;
  'jsx-a11y/no-static-element-interactions': NoStaticElementInteractions.RuleEntry;
  'jsx-a11y/prefer-tag-over-role': PreferTagOverRole.RuleEntry;
  'jsx-a11y/role-has-required-aria-props': RoleHasRequiredAriaProps.RuleEntry;
  'jsx-a11y/role-supports-aria-props': RoleSupportsAriaProps.RuleEntry;
  'jsx-a11y/scope': Scope.RuleEntry;
  'jsx-a11y/tabindex-no-positive': TabindexNoPositive.RuleEntry;

  // deprecated
  'jsx-a11y/accessible-emoji': AccessibleEmoji.RuleEntry;
  'jsx-a11y/label-has-for': LabelHasFor.RuleEntry;
  'jsx-a11y/no-onchange': NoOnchange.RuleEntry;
}>;

export type EslintJsxA11yRulesOption = Readonly<{
  'jsx-a11y/alt-text': AltText.Options;
  'jsx-a11y/anchor-ambiguous-text': AnchorAmbiguousText.Options;
  'jsx-a11y/anchor-has-content': AnchorHasContent.Options;
  'jsx-a11y/anchor-is-valid': AnchorIsValid.Options;
  'jsx-a11y/aria-activedescendant-has-tabindex': AriaActivedescendantHasTabindex.Options;
  'jsx-a11y/aria-props': AriaProps.Options;
  'jsx-a11y/aria-proptypes': AriaProptypes.Options;
  'jsx-a11y/aria-role': AriaRole.Options;
  'jsx-a11y/aria-unsupported-elements': AriaUnsupportedElements.Options;
  'jsx-a11y/autocomplete-valid': AutocompleteValid.Options;
  'jsx-a11y/click-events-have-key-events': ClickEventsHaveKeyEvents.Options;
  'jsx-a11y/control-has-associated-label': ControlHasAssociatedLabel.Options;
  'jsx-a11y/heading-has-content': HeadingHasContent.Options;
  'jsx-a11y/html-has-lang': HtmlHasLang.Options;
  'jsx-a11y/iframe-has-title': IframeHasTitle.Options;
  'jsx-a11y/img-redundant-alt': ImgRedundantAlt.Options;
  'jsx-a11y/interactive-supports-focus': InteractiveSupportsFocus.Options;
  'jsx-a11y/label-has-associated-control': LabelHasAssociatedControl.Options;
  'jsx-a11y/lang': Lang.Options;
  'jsx-a11y/media-has-caption': MediaHasCaption.Options;
  'jsx-a11y/mouse-events-have-key-events': MouseEventsHaveKeyEvents.Options;
  'jsx-a11y/no-access-key': NoAccessKey.Options;
  'jsx-a11y/no-aria-hidden-on-focusable': NoAriaHiddenOnFocusable.Options;
  'jsx-a11y/no-autofocus': NoAutofocus.Options;
  'jsx-a11y/no-distracting-elements': NoDistractingElements.Options;
  'jsx-a11y/no-interactive-element-to-noninteractive-role': NoInteractiveElementToNoninteractiveRole.Options;
  'jsx-a11y/no-noninteractive-element-interactions': NoNoninteractiveElementInteractions.Options;
  'jsx-a11y/no-noninteractive-element-to-interactive-role': NoNoninteractiveElementToInteractiveRole.Options;
  'jsx-a11y/no-noninteractive-tabindex': NoNoninteractiveTabindex.Options;
  'jsx-a11y/no-redundant-roles': NoRedundantRoles.Options;
  'jsx-a11y/no-static-element-interactions': NoStaticElementInteractions.Options;
  'jsx-a11y/prefer-tag-over-role': PreferTagOverRole.Options;
  'jsx-a11y/role-has-required-aria-props': RoleHasRequiredAriaProps.Options;
  'jsx-a11y/role-supports-aria-props': RoleSupportsAriaProps.Options;
  'jsx-a11y/scope': Scope.Options;
  'jsx-a11y/tabindex-no-positive': TabindexNoPositive.Options;
}>;
