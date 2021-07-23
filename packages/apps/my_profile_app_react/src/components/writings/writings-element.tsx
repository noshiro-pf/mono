import { Card, CardContent, Typography } from '@material-ui/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';

export const WritingsElement = memoNamed<
  Readonly<{
    link: string;
    title: string;
    subtitle: string;
    body1: string;
  }>
>('WritingsElement', ({ link, title, subtitle, body1 }) => (
  <CardStyled>
    <CardContent>
      <Typography component='h5' variant='h5'>
        <a href={link} rel='noopener noreferrer' target='_blank'>
          {title}
        </a>
      </Typography>
      <Typography color='textSecondary' variant='subtitle1'>
        {subtitle}
      </Typography>
      <Typography color='initial' component='p' variant='body1'>
        {body1}
      </Typography>
    </CardContent>
  </CardStyled>
));

const CardStyled = styled(Card)`
  margin: 10px;
`;
