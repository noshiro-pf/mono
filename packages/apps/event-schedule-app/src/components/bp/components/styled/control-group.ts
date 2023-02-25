import { newRenderLayer, ptBorderRadiusPx } from '../../constants';

export const ControlGroupStyled = styled.div`
  ${newRenderLayer};

  // create a new stacking context to isolate all the z-indices
  transform: translateZ(0);

  display: flex;
  > * {
    flex-grow: 0;
    flex-shrink: 0;
  }

  // each child is full height
  align-items: stretch;

  // round the left corners of the left-most element
  > :first-of-type {
    border-radius: ${ptBorderRadiusPx}px 0 0 ${ptBorderRadiusPx}px;
  }

  // round the right corners of the right-most element
  > :last-of-type {
    border-radius: 0 ${ptBorderRadiusPx}px ${ptBorderRadiusPx}px 0;
    margin-right: 0;
  }

  // round all the corners of the only child element
  > :only-child {
    border-radius: ${ptBorderRadiusPx}px;
    margin-right: 0;
  }
`;
