import { type EslintJsxA11yRules } from '../types/index.mjs';
import { withDefaultOption } from '../types/rule-severity-branded.mjs';

/** @link https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/src/index.js */
export const eslintJsxA11yRules: EslintJsxA11yRules = {
  'jsx-a11y/alt-text': withDefaultOption('error'),
  'jsx-a11y/anchor-ambiguous-text': withDefaultOption('error'),
  'jsx-a11y/anchor-has-content': withDefaultOption('error'),
  'jsx-a11y/anchor-is-valid': withDefaultOption('error'),
  'jsx-a11y/aria-activedescendant-has-tabindex': withDefaultOption('error'),
  'jsx-a11y/aria-props': withDefaultOption('error'),
  'jsx-a11y/aria-proptypes': withDefaultOption('error'),
  'jsx-a11y/aria-role': withDefaultOption('error'),
  'jsx-a11y/aria-unsupported-elements': withDefaultOption('error'),
  'jsx-a11y/autocomplete-valid': withDefaultOption('error'),
  'jsx-a11y/click-events-have-key-events': withDefaultOption('error'),

  'jsx-a11y/control-has-associated-label': 'off',

  'jsx-a11y/heading-has-content': withDefaultOption('error'),
  'jsx-a11y/html-has-lang': withDefaultOption('error'),
  'jsx-a11y/iframe-has-title': withDefaultOption('error'),
  'jsx-a11y/img-redundant-alt': withDefaultOption('error'),

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

  'jsx-a11y/label-has-associated-control': withDefaultOption('error'),
  'jsx-a11y/lang': withDefaultOption('error'),
  'jsx-a11y/media-has-caption': withDefaultOption('error'),
  'jsx-a11y/mouse-events-have-key-events': withDefaultOption('error'),
  'jsx-a11y/no-access-key': withDefaultOption('error'),
  'jsx-a11y/no-aria-hidden-on-focusable': withDefaultOption('error'),
  'jsx-a11y/no-autofocus': withDefaultOption('error'),
  'jsx-a11y/no-distracting-elements': withDefaultOption('error'),

  /* recommended */
  // 'jsx-a11y/no-interactive-element-to-noninteractive-role': [
  //   'error',
  //   {
  //     tr: ['none', 'presentation'],
  //     canvas: ['img'],
  //   },
  // ],
  /* strict */
  'jsx-a11y/no-interactive-element-to-noninteractive-role':
    withDefaultOption('error'),

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
  'jsx-a11y/no-noninteractive-element-to-interactive-role':
    withDefaultOption('error'),

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
  'jsx-a11y/no-noninteractive-tabindex': withDefaultOption('error'),

  'jsx-a11y/no-redundant-roles': withDefaultOption('error'),

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
  'jsx-a11y/no-static-element-interactions': withDefaultOption('error'),

  'jsx-a11y/prefer-tag-over-role': withDefaultOption('error'),
  'jsx-a11y/role-has-required-aria-props': withDefaultOption('error'),
  'jsx-a11y/role-supports-aria-props': withDefaultOption('error'),
  'jsx-a11y/scope': withDefaultOption('error'),
  'jsx-a11y/tabindex-no-positive': withDefaultOption('error'),

  // deprecated
  'jsx-a11y/accessible-emoji': 0,
  'jsx-a11y/label-has-for': 0,
  'jsx-a11y/no-onchange': 0,
} as const;
