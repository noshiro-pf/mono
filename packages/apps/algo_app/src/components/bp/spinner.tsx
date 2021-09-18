import { keyframes, styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';

export const Spinner = memoNamed('Spinner', () => (
  <Root role='progressbar'>
    <SpinnerAnimation>
      <svg
        height='50'
        strokeWidth='8.00'
        viewBox='1.00 1.00 98.00 98.00'
        width='50'
      >
        <SpinnerTrack d='M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90' />
        <SpinnerHead
          d='M 50,50 m 0,-45 a 45,45 0 1 1 0,90 a 45,45 0 1 1 0,-90'
          pathLength='280'
          strokeDasharray='280 280'
          strokeDashoffset='210'
        />
      </svg>
    </SpinnerAnimation>
  </Root>
));

const Root = styled('div')`
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  overflow: visible;
  vertical-align: middle;
`;

const rotate = keyframes`
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(1turn);
    transform: rotate(1turn);
  }
`;

const SpinnerAnimation = styled('div')`
  width: 50px;
  height: 50px;
  -webkit-animation: ${rotate} 0.5s linear infinite;
  animation: ${rotate} 0.5s linear infinite;
`;

const SpinnerPath = styled('path')`
  fill-opacity: 0;
`;

const SpinnerTrack = styled(SpinnerPath)`
  stroke: rgba(92, 112, 128, 0.2);
`;

const SpinnerHead = styled(SpinnerPath)`
  stroke: rgba(92, 112, 128, 0.8);
  stroke-linecap: round;
  -webkit-transform-origin: center;
  transform-origin: center;
  -webkit-transition: stroke-dashoffset 0.2s cubic-bezier(0.4, 1, 0.75, 0.9);
  transition: stroke-dashoffset 0.2s cubic-bezier(0.4, 1, 0.75, 0.9);
`;
