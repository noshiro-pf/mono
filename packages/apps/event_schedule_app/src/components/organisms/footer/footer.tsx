import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { aboutThisAppUrl, texts } from '../../../constants';

export const Footer = memoNamed('Footer', () => (
  <ReelaseNotesUrlWrapper>
    <a href={aboutThisAppUrl} target='_blank' rel='noopener noreferrer'>
      {texts.aboutThisApp}
    </a>
  </ReelaseNotesUrlWrapper>
));

const ReelaseNotesUrlWrapper = styled.div`
  margin: 10px;
  display: flex;
  justify-content: flex-end;
`;
