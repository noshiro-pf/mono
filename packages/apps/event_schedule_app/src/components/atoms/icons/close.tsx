import { memoNamed } from '@noshiro/react-utils';
import { CSSProperties } from 'react';

type Props = Readonly<{
  size?: number;
  color?: string;
  style?: CSSProperties;
}>;

export const CloseIcon = memoNamed<Props>(
  'CloseIcon',
  ({ size = 16, color = 'black', style }) => (
    <svg
      style={style}
      width={size}
      height={size}
      viewBox='0 0 32 32'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M31.6464 2.63927C31.8417 2.44401 31.8417 2.12742 31.6464 1.93216L30.0678 0.353553C29.8726 0.158291 29.556 0.158291 29.3607 0.353553L16 13.7143L2.63927 0.353553C2.44401 0.158291 2.12742 0.158291 1.93216 0.353553L0.353553 1.93216C0.158291 2.12742 0.158291 2.44401 0.353553 2.63927L13.7143 16L0.353553 29.3607C0.158291 29.556 0.158291 29.8726 0.353553 30.0678L1.93216 31.6464C2.12742 31.8417 2.44401 31.8417 2.63927 31.6464L16 18.2857L29.3607 31.6464C29.556 31.8417 29.8726 31.8417 30.0678 31.6464L31.6464 30.0678C31.8417 29.8726 31.8417 29.556 31.6464 29.3607L18.2857 16L31.6464 2.63927Z'
        fill={color}
      />
    </svg>
  )
);
