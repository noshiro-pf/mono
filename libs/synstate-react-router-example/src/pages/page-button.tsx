import * as React from 'react';
import { router, routes } from '../routes';

type Props = Readonly<{ currentPage: number; pageNumber: number }>;

export const PageButton = React.memo<Props>((props) => {
  const handleClick = React.useCallback(() => {
    router.setQueryParam(routes.products.queryParams.page, props.pageNumber);
  }, [props.pageNumber]);

  return (
    <button
      disabled={props.pageNumber === props.currentPage}
      type={'button'}
      onClick={handleClick}
    >
      {props.pageNumber}
    </button>
  );
});

PageButton.displayName = 'PageButton';
