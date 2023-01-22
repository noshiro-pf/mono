export const MuiAppBar = styled('header')`
  /* Mui-paper-root */
  color: rgba(0, 0, 0, 0.87);
  transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  background-color: #fff;

  /* MuiAppBar-root */
  width: 100%;
  display: flex;
  z-index: 1100;
  box-sizing: border-box;
  flex-shrink: 0;
  flex-direction: column;

  /* position="static" */
  position: sticky;
  top: 0;

  /* color="default"  */
  color: rgba(0, 0, 0, 0.87);
  background-color: #f5f5f5;

  /* MuiPaper-elevation4 */
  box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%),
    0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
`;
