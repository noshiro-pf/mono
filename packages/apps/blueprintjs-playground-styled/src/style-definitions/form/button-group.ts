import styled from 'styled-components';

export const ButtonGroup = styled.div`
  display: inline-flex;
`;

export const ButtonGroupVertical = styled(ButtonGroup)`
  align-items: stretch;
  flex-direction: column;
  vertical-align: top;
`;
