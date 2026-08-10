type Props = Readonly<{ n: number; opacity: number }>;

export const DiceNumber = memoNamed<Props>('DiceNumber', ({ n, opacity }) => {
  const style = useMemo(
    () => ({ borderColor: `rgba(143, 186, 255, ${opacity})` }),
    [opacity],
  );

  return (
    <div
      css={css`
        background-color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border-style: solid;
        border-width: 2px;
        border-color: gray;
        display: flex;
        justify-content: center;
        align-items: center;
      `}
      style={style}
    >
      {n < 1 ? 0 : n}
    </div>
  );
});
