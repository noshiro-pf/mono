import { styled } from '@noshiro/goober';

export const MuiCard = styled('div')`
  /* MuiPaper-root */
  color: rgba(0, 0, 0, 0.87);
  transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  background-color: #fff;

  /* MuiCard-root */

  overflow: hidden;

  /* iSmSzu */
  margin: 10px;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-flex-direction: row;
  -ms-flex-direction: row;
  flex-direction: row;

  /* MuiPaper-elevation1 */
  box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%),
    0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);

  /* MuiPaper-rounded */
  border-radius: 4px;
`;
