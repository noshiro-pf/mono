import styled from '@emotion/styled';

export const Anchor = styled.a`
  cursor: pointer;
  text-decoration: none;

  background-color: #f6f7f9;
  background-image: linear-gradient(
    to bottom,
    rgba(17, 20, 24, 0),
    rgba(17, 20, 24, 0.05)
  );
  box-shadow:
    inset 0 0 0 1px rgb(17 20 24 / 20%),
    inset 0 -1px 0 rgb(17 20 24 / 10%);
  color: #1c2127;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  border: none;
  border-radius: 3px;
  font-size: 14px;
  justify-content: center;
  padding: 5px 10px;
  text-align: left;
  vertical-align: middle;
  min-height: 30px;
  min-width: 30px;

  &:hover {
    color: #1c2127;
    text-decoration: none;
    background-clip: padding-box;
    background-color: #edeff2;
    box-shadow:
      inset 0 0 0 1px rgb(17 20 24 / 20%),
      inset 0 -1px 0 rgb(17 20 24 / 10%);
  }

  > * {
    margin-right: 7px;
  }
  > &:last-of-type {
    margin-right: 0;
  }
`;
