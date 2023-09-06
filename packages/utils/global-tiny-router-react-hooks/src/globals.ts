/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-member-access,
  functional/immutable-data
*/

import { useRouterLinkClick } from '@noshiro/tiny-router-react-hooks';

(global as any).useRouterLinkClick = useRouterLinkClick;
