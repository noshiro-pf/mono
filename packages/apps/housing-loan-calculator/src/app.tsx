import { Spinner, SpinnerSize } from '@blueprintjs/core';
import { ConfigSection, PaymentTable, SummarySection } from './components';
import { isCalculating$ } from './store';

export const App = memoNamed('App', () => {
  const isCalculating = useObservableValue(isCalculating$);

  return (
    <div
      css={css`
        min-height: 100vh;
        padding: 10px;
      `}
    >
      <div
        css={css`
          padding: 10px;
          font-size: x-large;
          font-weight: bold;
          color: white;
        `}
      >
        {dict.appTitle}
      </div>
      <Section>
        <Paper>
          <ConfigSection />
        </Paper>
      </Section>
      <Section>
        <Paper>
          {isCalculating ? (
            <SpinnerWrapper>
              <Spinner intent={'primary'} size={SpinnerSize.STANDARD} />
            </SpinnerWrapper>
          ) : (
            <SummarySection />
          )}
        </Paper>
      </Section>
      <Section>
        <Paper>
          {isCalculating ? (
            <SpinnerWrapper>
              <Spinner intent={'primary'} size={SpinnerSize.STANDARD} />
            </SpinnerWrapper>
          ) : (
            <PaymentTable />
          )}
        </Paper>
      </Section>
    </div>
  );
});

const Section = styled.div`
  padding: 5px 0;
`;

const Paper = styled.div`
  padding: 10px;
  border-radius: 5px;
  background-color: #f5f8fa;
`;

const SpinnerWrapper = styled.div`
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
