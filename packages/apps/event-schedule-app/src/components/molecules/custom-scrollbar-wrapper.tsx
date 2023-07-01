export const CustomScrollbarWrapper = styled.div`
  overflow-x: scroll;

  &::-webkit-scrollbar {
    width: 7px;
    height: 7px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgb(165, 165, 165);
    border-radius: 7px;
  }
  &::-webkit-scrollbar-track {
    background-color: rgb(220, 220, 220);
    border-radius: 7px;
  }
  &::-webkit-scrollbar-corner {
    display: none;
  }
`;
