import { keyframes } from '@noshiro/goober';

const dotColor = '232, 232, 232';

const dotColorPale = `rgba(${dotColor}, 0.2)`;
const dotColorClear = `rgba(${dotColor}, 1)`;

const timeScale = 1; /* sec */

const dotFlashing = keyframes`
  0%, 50% {
    background-color: ${dotColorPale};
  }

  100% {
    background-color: ${dotColorClear};
  }
`;

export const LoadingDots = styled('div')`
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${dotColorPale};
  color: ${dotColorPale};
  animation: ${dotFlashing} ${timeScale}s infinite linear alternate;
  animation-delay: ${timeScale / 2}s;

  &::before,
  &::after {
    content: '';
    display: inline-block;
    position: absolute;
    top: 0;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: ${dotColorPale};
    color: ${dotColorPale};
    animation: ${dotFlashing} ${timeScale}s infinite alternate;
  }

  &::before {
    left: -15px;
    animation-delay: 0s;
  }

  &::after {
    left: 15px;
    animation-delay: ${timeScale}s;
  }
`;
