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
        <a target='_blank' href={link} rel='noopener noreferrer'>
          {title}
        </a>
      </Typography>
      <Typography variant='subtitle1' color='textSecondary'>
        {subtitle}
      </Typography>
      <Typography variant='body1' component='p' color='initial'>
        {body1}
      </Typography>
    </CardContent>
  </CardStyled>
));

const CardStyled = styled(Card)`
  margin: 10px;
`;
