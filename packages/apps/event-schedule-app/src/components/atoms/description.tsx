import { descriptionFontColor } from '../../constants';

type Props = Readonly<{
  text: string;
  error?: boolean;
  color?: string;
}>;

export const Description = memoNamed<Props>(
  'Description',
  ({ text, error = false, color }) => (
    <div
      css={css`
        font-size: smaller;
        margin-bottom: 5px;
      `}
      style={{
        color:
          color ??
          (error ? descriptionFontColor.error : descriptionFontColor.normal),
      }}
    >
      {text}
    </div>
  )
);
