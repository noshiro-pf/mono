import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { aboutThisAppUrl, dict } from '../../constants';

export const Footer = memoNamed('Footer', () => (
  <ReleaseNotesUrlWrapper>
    <a href={aboutThisAppUrl} rel={'noopener noreferrer'} target={'_blank'}>
      {dict.aboutThisApp}
    </a>
  </ReleaseNotesUrlWrapper>
));

const ReleaseNotesUrlWrapper = styled.div`
  padding: 10px;
  display: flex;
  justify-content: flex-end;
`;
