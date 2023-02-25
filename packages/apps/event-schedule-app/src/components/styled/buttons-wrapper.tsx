export const SingleButtonWrapper = styled.div`
  margin: 5px;
`;

export const ButtonsWrapperNowrap = styled.div`
  margin: 5px;
  display: flex;
  align-items: center;

  & > * {
    margin-right: 5px; // margin between this button and the next button
  }
  &::last-of-type {
    margin-right: 0;
  }
`;

export const ButtonsWrapper = styled(ButtonsWrapperNowrap)`
  flex-wrap: wrap-reverse;
  margin-top: 10px;
  margin-bottom: 5px; // margin between this button and the buttons on next line
`;

export const ButtonsWrapperAlignEnd = styled(ButtonsWrapper)`
  justify-content: flex-end;
`;
