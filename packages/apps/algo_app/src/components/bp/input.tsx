import { styled } from '@noshiro/goober';

export const Input = styled('input')`
  appearance: none;
  background: #fff;
  border: none;
  border-radius: 3px;
  box-shadow: 0 0 0 0 rgb(19 124 189 / 0%), 0 0 0 0 rgb(19 124 189 / 0%),
    inset 0 0 0 1px rgb(16 22 26 / 15%), inset 0 1px 1px rgb(16 22 26 / 20%);
  color: #182026;
  font-size: 14px;
  font-weight: 400;
  height: 30px;
  line-height: 30px;
  outline: none;
  padding: 0 10px;
  transition: box-shadow 0.1s cubic-bezier(0.4, 1, 0.75, 0.9);
  vertical-align: middle;

  &:focus {
    box-shadow: 0 0 0 1px #137cbd, 0 0 0 3px rgb(19 124 189 / 30%),
      inset 0 1px 1px rgb(16 22 26 / 20%);
  }

  &:disabled {
    background: rgba(206, 217, 224, 0.5);
    -webkit-box-shadow: none;
    box-shadow: none;
    color: rgba(92, 112, 128, 0.6);
    cursor: not-allowed;
    resize: none;
  }
`;
