import {
  centeredTextPaddingPx,
  ptDividerBlack,
  ptFontSizePx,
  ptGridSizePx,
  ptHeadingColor,
  ptTextColor,
} from '../../constants';

const tableRowHeightPx = ptGridSizePx * 4;
const tableBorderWidthPx = 1;
const tableBorderColor = ptDividerBlack;

export const HTMLTableStyled = styled.table`
  border-spacing: 0;
  font-size: ${ptFontSizePx}px;

  th,
  td {
    padding: ${centeredTextPaddingPx(tableRowHeightPx)}px;
    text-align: center;
    vertical-align: center;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
  }

  th {
    color: ${ptHeadingColor};
    font-weight: 600;
  }

  td {
    color: ${ptTextColor};
  }

  tbody tr:first-child,
  tfoot tr:first-child {
    th,
    td {
      box-shadow: inset 0 ${tableBorderWidthPx}px 0 0 ${tableBorderColor};
    }
  }
`;

export const HTMLTableBorderedStyled = styled(HTMLTableStyled)`
  /* bordered */
  th:not(:first-child) {
    box-shadow: inset ${tableBorderWidthPx}px 0 0 0 ${tableBorderColor};
  }

  tbody tr td,
  tfoot tr td {
    box-shadow: inset 0 ${tableBorderWidthPx}px 0 0 ${tableBorderColor};

    &:not(:first-child) {
      box-shadow: inset ${tableBorderWidthPx}px ${tableBorderWidthPx}px 0 0
        ${tableBorderColor};
    }
  }
`;
