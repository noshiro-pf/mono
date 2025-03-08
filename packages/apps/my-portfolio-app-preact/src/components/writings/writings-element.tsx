import { MuiCard, MuiCardContent, MuiTypography } from '../mui';

export const WritingsElement = memoNamed<
  Readonly<{
    link: string;
    title: string;
    subtitle: string;
    body: string;
  }>
>('WritingsElement', ({ link, title, subtitle, body }) => (
  <CardStyled>
    <MuiCardContent>
      <MuiTypography variant={'title'}>
        <a href={link} rel={'noopener noreferrer'} target={'_blank'}>
          {title}
        </a>
      </MuiTypography>
      <MuiTypography variant={'subtitle1'}>{subtitle}</MuiTypography>
      <MuiTypography variant={'body1'}>{body}</MuiTypography>
    </MuiCardContent>
  </CardStyled>
));

const CardStyled = styled(MuiCard)`
  margin: 10px;
`;
