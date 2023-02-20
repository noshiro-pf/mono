import { ptInput } from '../style-definitions';

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const InputGroupView = memoNamed<Props>(
  'InputGroupView',
  ({ value, placeholder, disabled, onChange }) => (
    <div
      css={css`
        display: block;
        position: relative;

        ${disabled === true
          ? css`
              cursor: not-allowed;
            `
          : css``}
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
        type='text'
        value={value}
        onChange={onChange}
      />
    </div>
  )
);
