import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { aboutThisAppUrl, texts } from '../../../constants';

export const Footer = memoNamed('Footer', () => (
  <ReleaseNotesUrlWrapper>
    <a href={aboutThisAppUrl} target='_blank' rel='noopener noreferrer'>
      {texts.aboutThisApp}
    </a>
  </ReleaseNotesUrlWrapper>
));

const ReleaseNotesUrlWrapper = styled.div`
  padding: 10px;
  display: flex;
  justify-content: flex-end;
`;
