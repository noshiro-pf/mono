import { Card, CardContent, Divider, Typography } from '@material-ui/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';

const CardStyled = styled(Card)`
  margin: 10px;
  display: flex;
  flex-direction: column;
`;

const CardContentStyled = styled(CardContent)`
  flex: 1 1 auto;
`;

const ImgStyled = styled.img`
  width: 100%;
  object-fit: fill;
`;

const DividerWithMargin = styled(Divider)`
  margin: 10px;
`;

export const ProductsElementMobileView = memoNamed<{
  imageUrl: string;
  link: string;
  title: string;
  subtitle: string;
  body1: string;
  body2: string;
}>(
  'ProductsElementMobileView',
  ({ imageUrl, link, title, subtitle, body1, body2 }) => (
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
        {imageUrl === '' ? undefined : <ImgStyled alt='' src={imageUrl} />}
        <DividerWithMargin />
        <Typography variant='body1' component='p' color='initial'>
          {body1}
        </Typography>
        <Typography variant='body2' component='p' color='textPrimary'>
          {'［実装］：' + body2}
        </Typography>
      </CardContentStyled>
    </CardStyled>
  )
);
