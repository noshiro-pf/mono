import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';
import type { ComponentChildren } from 'preact';

type Props = DeepReadonly<{
  // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
  variant: 'title' | 'subtitle1' | 'body1' | 'body2';
  children: ComponentChildren;
}>;

export const MuiTypography = memoNamed<Props>(
  'MuiTypography',
  ({ variant, children }) => {
    switch (variant) {
      case 'title':
        return <MuiTypographyTitle>{children}</MuiTypographyTitle>;

      case 'subtitle1':
        return <MuiTypographySubtitle1>{children}</MuiTypographySubtitle1>;
      case 'body1':
        return <MuiTypographyBody1>{children}</MuiTypographyBody1>;
      case 'body2':
        return <MuiTypographyBody2>{children}</MuiTypographyBody2>;
    }
  }
);

const MuiTypographyTitle = styled('h5')`
  /* MuiTypography-root */
  margin: 0;

  /* MuiTypography-h5 */
  font-size: 1.5rem;
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  font-weight: 400;
  line-height: 1.334;
  letter-spacing: 0em;

  /* MuiTypography-colorTextSecondary */
  color: rgba(0, 0, 0, 0.54);
`;

const MuiTypographySubtitle1 = styled('h6')`
  /* MuiTypography-root */
  margin: 0;

  /* MuiTypography-subtitle1 */
  font-size: 1rem;
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  font-weight: 400;
  line-height: 1.75;
  letter-spacing: 0.00938em;

  /* MuiTypography-colorTextSecondary */
  color: rgba(0, 0, 0, 0.54);
`;

const MuiTypographyBody1 = styled('p')`
  /* MuiTypography-root */
  margin: 0;

  /* MuiTypography-body1 */
  font-size: 1rem;
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.00938em;
`;

const MuiTypographyBody2 = styled('p')`
  /* MuiTypography-root */
  margin: 0;

  /* MuiTypography-body2 */
  font-size: 0.875rem;
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: 0.01071em;

  /* MuiTypography-colorTextPrimary */
  color: rgba(0, 0, 0, 0.87);
`;
