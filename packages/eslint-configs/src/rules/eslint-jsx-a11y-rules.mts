import { type EslintJsxA11yRules } from '../types/index.mjs';

/** @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/src/index.js */
export const eslintJsxA11yRules: EslintJsxA11yRules = {
  'jsx-a11y/alt-text': 'error',
  'jsx-a11y/anchor-ambiguous-text': 'error',
  'jsx-a11y/anchor-has-content': 'error',
  'jsx-a11y/anchor-is-valid': 'error',
  'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
  'jsx-a11y/aria-props': 'error',
  'jsx-a11y/aria-proptypes': 'error',
  'jsx-a11y/aria-role': 'error',
  'jsx-a11y/aria-unsupported-elements': 'error',
  'jsx-a11y/autocomplete-valid': 'error',
  'jsx-a11y/click-events-have-key-events': 'error',

  'jsx-a11y/control-has-associated-label': 'off',

  'jsx-a11y/heading-has-content': 'error',
  'jsx-a11y/html-has-lang': 'error',
  'jsx-a11y/iframe-has-title': 'error',
  'jsx-a11y/img-redundant-alt': 'error',

  'jsx-a11y/interactive-supports-focus': [
    'error',
    /* recommended */
    // {
    //   tabbable: [
    //     'button',
    //     'checkbox',
    //     'link',
    //     'searchbox',
    //     'spinbutton',
    //     'switch',
    //     'textbox',
    //   ],
    // },
    /* strict */
    {
      tabbable: [
        'button',
        'checkbox',
        'link',
        'progressbar',
        'searchbox',
        'slider',
        'spinbutton',
        'switch',
        'textbox',
      ],
    },
  ],

  'jsx-a11y/label-has-associated-control': 'error',
  'jsx-a11y/lang': 'error',
  'jsx-a11y/media-has-caption': 'error',
  'jsx-a11y/mouse-events-have-key-events': 'error',
  'jsx-a11y/no-access-key': 'error',
  'jsx-a11y/no-aria-hidden-on-focusable': 'error',
  'jsx-a11y/no-autofocus': 'error',
  'jsx-a11y/no-distracting-elements': 'error',

  /* recommended */
  // 'jsx-a11y/no-interactive-element-to-noninteractive-role': [
  //   'error',
  //   {
  //     tr: ['none', 'presentation'],
  //     canvas: ['img'],
  //   },
  // ],
  /* strict */
  'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',

  /* recommended */
  // 'jsx-a11y/no-noninteractive-element-interactions': [
  //   'error',
  //   {
  //     handlers: [
  //       'onClick',
  //       'onError',
  //       'onLoad',
  //       'onMouseDown',
  //       'onMouseUp',
  //       'onKeyPress',
  //       'onKeyDown',
  //       'onKeyUp',
  //     ],
  //     alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
  //     body: ['onError', 'onLoad'],
  //     dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
  //     iframe: ['onError', 'onLoad'],
  //     img: ['onError', 'onLoad'],
  //   },
  // ],
  /* strict */
  'jsx-a11y/no-noninteractive-element-interactions': [
    'error',
    {
      body: ['onError', 'onLoad'],
      iframe: ['onError', 'onLoad'],
      img: ['onError', 'onLoad'],
    },
  ],

  /* recommended */
  // 'jsx-a11y/no-noninteractive-element-to-interactive-role': [
  //   'error',
  //   {
  //     ul: [
  //       'listbox',
  //       'menu',
  //       'menubar',
  //       'radiogroup',
  //       'tablist',
  //       'tree',
  //       'treegrid',
  //     ],
  //     ol: [
  //       'listbox',
  //       'menu',
  //       'menubar',
  //       'radiogroup',
  //       'tablist',
  //       'tree',
  //       'treegrid',
  //     ],
  //     li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
  //     table: ['grid'],
  //     td: ['gridcell'],
  //     fieldset: ['radiogroup', 'presentation'],
  //   },
  // ],
  /* strict */
  'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',

  /* recommended */
  // 'jsx-a11y/no-noninteractive-tabindex': [
  //   'error',
  //   {
  //     tags: [],
  //     roles: ['tabpanel'],
  //     allowExpressionValues: true,
  //   },
  // ],
  /* strict */
  'jsx-a11y/no-noninteractive-tabindex': 'error',

  'jsx-a11y/no-redundant-roles': 'error',

  /* recommended */
  // 'jsx-a11y/no-static-element-interactions': [
  //   'error',
  //   {
  //     allowExpressionValues: true,
  //     handlers: [
  //       'onClick',
  //       'onMouseDown',
  //       'onMouseUp',
  //       'onKeyPress',
  //       'onKeyDown',
  //       'onKeyUp',
  //     ],
  //   },
  // ],
  /* strict */
  'jsx-a11y/no-static-element-interactions': 'error',

  'jsx-a11y/prefer-tag-over-role': 'error',
  'jsx-a11y/role-has-required-aria-props': 'error',
  'jsx-a11y/role-supports-aria-props': 'error',
  'jsx-a11y/scope': 'error',
  'jsx-a11y/tabindex-no-positive': 'error',

  // deprecated
  'jsx-a11y/accessible-emoji': 0,
  'jsx-a11y/label-has-for': 0,
  'jsx-a11y/no-onchange': 0,
};
