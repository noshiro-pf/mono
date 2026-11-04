import { constant, type JSX } from 'synstate-dom';
import type { WritingsInfo } from '../../types/index.mjs';
import { MuiCard, MuiTypography } from '../mui/index.mjs';

type Props = Readonly<{
  writing: WritingsInfo;
}>;

export const WritingsElement = ({ writing }: Props): JSX.Element => (
  <MuiCard>
    <MuiTypography variant={'title'}>
      <a
        href={constant(writing.link)}
        rel={constant('noopener noreferrer')}
        target={constant('_blank')}
      >
        {constant(writing.title)}
      </a>
    </MuiTypography>
    <MuiTypography variant={'subtitle1'}>
      {constant(writing.subtitle)}
    </MuiTypography>
    <MuiTypography variant={'body1'}>{constant(writing.body)}</MuiTypography>
  </MuiCard>
);
