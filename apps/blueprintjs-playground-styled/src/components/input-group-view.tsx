import { css } from '@emotion/react';
import type * as React from 'react';
import { ptInput } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';

/**
 * Only the four attributes this view forwards.
 *
 * The pre-restoration source typed these props as the whole of
 * `React.DetailedHTMLProps<React.InputHTMLAttributes<…>, …>`, which
 * `ts-restrictions/check-destructuring-completeness` rejects: destructuring
 * four names out of some three hundred hides what the component ignores.
 */
type Props = Readonly<{
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}>;

export const InputGroupView = memoNamed<Props>(
  'InputGroupView',
  ({ value, placeholder, disabled, onChange }) => (
    <div
      css={css`
        display: block;
        position: relative;

        ${
          disabled === true
            ? css`
                cursor: not-allowed;
              `
            : css``
        }
      `}
    >
      <input
        css={css`
          ${ptInput}
          /* .bp3-input-group .bp3-input */
          position: relative;
          width: 100%;
        `}
        disabled={disabled}
        placeholder={placeholder}
        type={'text'}
        value={value}
        onChange={onChange}
      />
    </div>
  ),
);
