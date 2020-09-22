import styled from 'styled-components';

const Base = styled.button`
  height: 30px;
  width: 100%;
  border-radius: 15px;
  border-style: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  outline: none;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const LabelButtonItemBodyDisabledStyled = styled(Base)`
  background-color: rgba(0, 0, 0, 0.12);
  color: rgba(0, 0, 0, 0.26);
`;

export const LabelButtonItemBodyStyled = styled(Base)`
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
  box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12);
`;
