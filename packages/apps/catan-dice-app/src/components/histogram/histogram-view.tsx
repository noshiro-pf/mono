type Props = Readonly<{
  xy: readonly (readonly [number, number])[];
  max: number;
  numSample: number;
}>;

export const HistogramView = memoNamed<Props>(
  'HistogramView',
  ({ xy, max, numSample }) => (
    <Root>
      <NumSampleWrapper>
        <NumSample>
          {'N = '}
          {numSample}
        </NumSample>
      </NumSampleWrapper>
      <Main>
        {xy.map(([x, y]) => (
          <Column key={x}>
            <VerticalBarContainer>
              <VerticalBar
                style={{ height: `${max > 0 ? (100 * y) / max : 0}%` }}
              >
                {y > 0 ? y : ''}
              </VerticalBar>
            </VerticalBarContainer>
            <Domain>{x}</Domain>
          </Column>
        ))}
      </Main>
    </Root>
  )
);

const textHeightPx = 30;

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const NumSampleWrapper = styled.div`
  height: ${textHeightPx}px;
`;

const NumSample = styled.div`
  padding: 5px;
`;

const Main = styled.div`
  height: calc(100% - ${textHeightPx}px);
  display: flex;
  flex-direction: row;
`;

const Column = styled.div`
  width: calc(100% / 11);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
`;

const VerticalBarContainer = styled.div`
  width: 100%;
  height: calc(100% - ${textHeightPx}px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-color: #f7f7f7;
  padding: 5px 1px 0 1px;
`;

const VerticalBar = styled.div`
  width: 100%;
  background-color: #ff6f3f;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 5% 0;
  font-weight: bold;
`;

const Domain = styled.div`
  width: 100%;
  height: ${textHeightPx}px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
