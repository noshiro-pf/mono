import { RuleTester } from '@typescript-eslint/rule-tester';
import { noUnfocusableFocusHandler } from './no-unfocusable-focus-handler.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

ruleTester.run('no-unfocusable-focus-handler', noUnfocusableFocusHandler, {
  valid: [
    {
      name: 'a button takes the focus',
      code: 'const a = <button onFocus={f} onBlur={g} />;',
    },
    {
      name: 'every natively focusable control',
      code: 'const a = <><input onFocus={f} /><select onBlur={f} /><textarea onFocus={f} /><iframe onFocus={f} /><summary onFocus={f} /></>;',
    },
    {
      name: 'a link with href',
      code: 'const a = <a href={h} onFocus={f} />;',
    },
    {
      name: 'media with controls',
      code: 'const a = <video controls={c} onBlur={f} />;',
    },
    {
      name: 'an element given tabIndex',
      code: 'const a = <span tabIndex={t} onFocus={f} />;',
    },
    {
      name: 'an element given tabindex, as an attribute',
      code: 'const a = <div tabindex={t} onBlur={f} />;',
    },
    {
      name: 'an editable element',
      code: 'const a = <div contentEditable={c} onFocus={f} />;',
    },
    {
      name: 'the bubbling focusin and focusout',
      code: 'const a = <div onFocusIn={f} onFocusOut={g} />;',
    },
    {
      name: 'a component, whose props are its own',
      code: 'const a = <Tooltip onFocus={f} />;',
    },
    {
      name: 'a member expression tag is a component too',
      code: 'const a = <ui.Box onBlur={f} />;',
    },
    {
      name: 'a spread may carry tabIndex, so the element is not judged',
      code: 'const a = <div {...props} onFocus={f} />;',
    },
  ],
  invalid: [
    {
      name: 'onFocus on a span',
      code: 'const a = <span onFocus={f} />;',
      errors: [
        {
          messageId: 'unfocusable',
          suggestions: [
            {
              messageId: 'useBubbling',
              output: 'const a = <span onFocusIn={f} />;',
            },
          ],
        },
      ],
    },
    {
      name: 'onBlur on a div',
      code: 'const a = <div onBlur={f} />;',
      errors: [
        {
          messageId: 'unfocusable',
          suggestions: [
            {
              messageId: 'useBubbling',
              output: 'const a = <div onFocusOut={f} />;',
            },
          ],
        },
      ],
    },
    {
      name: 'both on a wrapper, each reported',
      code: 'const a = <div onFocus={f} onBlur={g}><input /></div>;',
      errors: [
        {
          messageId: 'unfocusable',
          suggestions: [
            {
              messageId: 'useBubbling',
              output:
                'const a = <div onFocusIn={f} onBlur={g}><input /></div>;',
            },
          ],
        },
        {
          messageId: 'unfocusable',
          suggestions: [
            {
              messageId: 'useBubbling',
              output:
                'const a = <div onFocus={f} onFocusOut={g}><input /></div>;',
            },
          ],
        },
      ],
    },
    {
      name: 'a link with no href takes no focus',
      code: 'const a = <a onFocus={f} />;',
      errors: [
        {
          messageId: 'unfocusable',
          suggestions: [
            {
              messageId: 'useBubbling',
              output: 'const a = <a onFocusIn={f} />;',
            },
          ],
        },
      ],
    },
  ],
});
