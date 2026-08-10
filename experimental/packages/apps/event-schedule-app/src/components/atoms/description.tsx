import { descriptionFontColor } from '../../constants';

type Props = Readonly<{
  text: string;
  error?: boolean;
  color?: string;
}>;

export const Description = memoNamed<Props>(
  'Description',
  ({ text, error = false, color }) => {
    const style = useMemo(
      () => ({
        color:
          color ??
          (error ? descriptionFontColor.error : descriptionFontColor.normal),
      }),
      [color, error],
    );

    return (
      <div
        css={css`
          font-size: smaller;
          margin-bottom: 5px;
        `}
        style={style}
      >
        {text}
      </div>
    );
  },
);
