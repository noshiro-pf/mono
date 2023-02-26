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

const HTMLTableStyledBase = styled.table`
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
`;

export const HTMLTableStyled = styled(HTMLTableStyledBase)`
  tbody tr:first-of-type,
  tfoot tr:first-of-type {
    th,
    td {
      box-shadow: inset 0 ${tableBorderWidthPx}px 0 0 ${tableBorderColor};
    }
  }
`;

export const HTMLTableBorderedStyled = styled(HTMLTableStyled)`
  /* bordered */
  th:not(:first-of-type) {
    box-shadow: inset ${tableBorderWidthPx}px 0 0 0 ${tableBorderColor};
  }

  tbody tr td,
  tfoot tr td {
    box-shadow: inset 0 ${tableBorderWidthPx}px 0 0 ${tableBorderColor};

    &:not(:first-of-type) {
      box-shadow: inset ${tableBorderWidthPx}px ${tableBorderWidthPx}px 0 0
        ${tableBorderColor};
    }
  }
`;

export const HTMLTableBorderedStyled2 = styled(HTMLTableStyledBase)`
  thead tr:first-of-type {
    th,
    td {
      border-bottom: ${tableBorderWidthPx}px solid ${tableBorderColor};
    }
  }
  thead tr:not(:last-of-type),
  tbody tr:not(:last-of-type),
  tfoot tr:not(:last-of-type) {
    th,
    td {
      border-bottom: ${tableBorderWidthPx}px solid ${tableBorderColor};
    }
  }

  thead tr,
  tbody tr,
  tfoot tr {
    th,
    td {
      &:not(:last-of-type) {
        border-right: ${tableBorderWidthPx}px solid ${tableBorderColor};
      }
    }
  }
`;
