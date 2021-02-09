import { Card, CardContent, Divider, Typography } from '@material-ui/core';
import { memoNamed } from '@mono/react-utils';
import styled from 'styled-components';

const CardStyled = styled(Card)`
  margin: 10px;
  display: flex;
  flex-direction: row;
`;

const CardContentStyled = styled(CardContent)`
  flex-grow: 1;
  flex-shrink: 1;
`;

const ImgStyled = styled.img`
  height: 300px;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 400px;
  max-width: 400px;
  object-fit: fill;
`;

const DividerWithMargin = styled(Divider)`
  margin: 10px;
`;

export const ProductsElementView = memoNamed<{
  link: string;
  title: string;
  subtitle: string;
  body1: string;
  body2: string;
  imageUrl: string;
}>(
  'ProductsElementView',
  ({ link, title, subtitle, body1, body2, imageUrl }) => (
    <CardStyled>
      <CardContentStyled>
        <Typography component='h5' variant='h5'>
          {link === '' ? (
            <span>{title}</span>
          ) : (
            <a target='_blank' href={link} rel='noopener noreferrer'>
              {title}
            </a>
          )}
        </Typography>
        <Typography variant='subtitle1' color='textSecondary'>
          {subtitle}
        </Typography>
        <DividerWithMargin />
        <Typography variant='body1' component='p' color='initial'>
          {body1}
        </Typography>
        <Typography variant='body2' component='p' color='textPrimary'>
          {'［実装］：' + body2}
        </Typography>
      </CardContentStyled>
      {imageUrl === '' ? undefined : <ImgStyled alt='' src={imageUrl} />}
    </CardStyled>
  )
);
