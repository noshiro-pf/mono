type Props = Readonly<{ contrastRatioList: readonly PositiveFiniteNumber[] }>;

export const ContrastRatioList = memoNamed<Props>(
  'ContrastRatioList',
  (props) => (
    <div
      css={css`
        padding: 10px;
        display: flex;
      `}
    >
      <div>{'隣り合う二色のコントラスト比：'}</div>
      {'['}
      {props.contrastRatioList.map((r, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>{`${r.toFixed(2)}, `}&nbsp;</div>
      ))}
      {']'}
    </div>
  )
);
