export const SingleButtonWrapper = styled.div`
  margin: 5px;
`;

export const ButtonsWrapper = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap-reverse;
  & > * {
    margin-right: 5px; // margin between this button and the next button
    margin-bottom: 5px; // margin between this button and the buttons on next line
  }
  &::last-child {
    margin-right: 0;
  }
`;

export const ButtonsWrapperAlignEnd = styled(ButtonsWrapper)`
  justify-content: flex-end;
`;
