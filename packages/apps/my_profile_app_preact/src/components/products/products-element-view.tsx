import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';
import { MuiCard, MuiCardContent, MuiDivider, MuiTypography } from '../mui';

export const ProductsElementView = memoNamed<
  Readonly<{
    link: string;
    title: string;
    subtitle: string;
    description: string;
    implementation: string;
    imageUrl: string;
  }>
>(
  'ProductsElementView',
  ({ link, title, subtitle, description, implementation, imageUrl }) => (
    <CardStyled>
      <CardContentStyled>
        <MuiTypography variant={'title'}>
          {link === '' ? (
            <span>{title}</span>
          ) : (
            <a href={link} rel={'noopener noreferrer'} target={'_blank'}>
              {title}
            </a>
          )}
        </MuiTypography>
        <MuiTypography variant={'subtitle1'}>{subtitle}</MuiTypography>

        <MuiDivider />

        <BodyWrapper>
          <MuiTypography variant={'body1'}>{description}</MuiTypography>
          <MuiTypography
            variant={'body2'}
          >{`［実装］：${implementation}`}</MuiTypography>
        </BodyWrapper>

        {imageUrl === '' ? undefined : (
          <ImgStyled alt={imageUrl} src={imageUrl} />
        )}
      </CardContentStyled>
    </CardStyled>
  )
);

const CardStyled = styled(MuiCard)`
  margin: 10px;
  display: flex;

  flex-direction: row;
`;

const CardContentStyled = styled(MuiCardContent)`
  flex: auto;
  overflow: auto;
`;

const ImgStyled = styled('img')`
  max-height: 300px;
  max-width: min(480px, 100%);
  object-fit: contain;

  filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.25));
`;

const BodyWrapper = styled('div')`
  margin: 10px 0;
  white-space: pre-wrap;
`;
