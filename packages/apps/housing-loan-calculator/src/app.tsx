// import { uriWithQueryParams } from './utils';
import { Spinner, SpinnerSize } from '@blueprintjs/core';
import { useMainHooks } from './app-hooks';
import { ConfigSection, PaymentTable, SummarySection } from './components';
import { viewTexts } from './constants';

export const App = memoNamed('App', () => {
  const { isCalculating } = useMainHooks();

  return (
    <Root>
      <Title>{viewTexts.appTitle}</Title>
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
    </Root>
  );
});

const Root = styled.div`
  min-height: 100vh;
  padding: 10px;
`;

const Title = styled.div`
  padding: 10px;
  font-size: x-large;
  font-weight: bold;
  color: white;
`;

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
