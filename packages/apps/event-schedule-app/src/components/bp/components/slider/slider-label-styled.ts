export const SliderLabelStyled = styled.div`
  transform: translate(-50%, 20px);
  display: inline-block;
  font-size: 12px;
  line-height: 1;
  padding: 2px 5px;
  position: absolute;
  vertical-align: top;
`;

export const SliderLabelMinStyled = styled(SliderLabelStyled)`
  left: 0%;
`;

export const SliderLabelMaxStyled = styled(SliderLabelStyled)`
  left: 100%;
`;
