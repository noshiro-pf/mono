import { aboutThisAppUrl } from '../../constants';

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