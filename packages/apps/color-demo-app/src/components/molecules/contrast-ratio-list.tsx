type Props = Readonly<{ contrastRatioList: readonly number[] }>;

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
      {Arr.map(props.contrastRatioList, (r, i) => (
        <div key={i}>{`${r.toFixed(2)}, `}&nbsp;</div>
      ))}
      {']'}
    </div>
  )
);
