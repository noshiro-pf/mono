import { AppBar } from '@material-ui/core';
import { useNavigator, usePathNameList } from '@mono/react-router-utils';
import { memoNamed } from '@mono/react-utils';
import { last } from '@mono/ts-utils';
import React, { useCallback, useMemo } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import { LastUpdated } from './components/last-updated';
import { Products } from './components/products/products';
import { MarkdownPage } from './components/shared/markdown-page';
import { Writings } from './components/writings/writings';
import { contentsUrls } from './constants/contents-urls';
import { routes, routesList } from './constants/routes';
import { MyTabs } from './utils/tabs';

const LastUpdatedWrapper = styled.div`
  padding: 10px 15px 0 0;
  display: flex;
  justify-content: flex-end;
`;

const ContentWrapper = styled.div`
  padding: 0 20px 20px 20px;
`;

const MyTabsStyled = styled(MyTabs)`
  font-size: large;
`;

const AppBarFlex = styled(AppBar)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const labels = ['Profile', 'Profile2', 'Skills', 'Products', 'Writings'];

const pathNameLastToIndex = (pathNameLast: string): number | undefined => {
  const res = routesList.findIndex((e) => e === `/${pathNameLast}`);
  return res === -1 ? undefined : res;
};

export const AppSub = memoNamed<{
  mobile: boolean;
}>('AppSub', ({ mobile }) => {
  const pathName = usePathNameList();
  const pathNameLast = useMemo(() => last(pathName) ?? '', [pathName]);

  // pathnameと対応させるため、routerを使ってタブ切り替えを制御
  const tabIndex = useMemo(
    //
    () => pathNameLastToIndex(pathNameLast) ?? 0,
    [pathNameLast]
  );

  const navigator = useNavigator();

  const tabIndexOnChange = useCallback(
    (tabIdx: number) => {
      if (0 <= tabIdx && tabIdx < routesList.length) {
        navigator(routesList[tabIdx]);
      }
    },
    [navigator]
  );

  return (
    <div>
      <AppBarFlex position='static' color='default'>
        <MyTabsStyled
          tabIndex={tabIndex}
          tabIndexChange={tabIndexOnChange}
          scrollable={true}
          labels={labels}
        />
      </AppBarFlex>

      <LastUpdatedWrapper>
        <LastUpdated />
      </LastUpdatedWrapper>

      <ContentWrapper>
        <Switch>
          <Route exact={true} path={routes.profile}>
            <MarkdownPage url={contentsUrls.profile} />
          </Route>
          <Route exact={true} path={routes.profile2}>
            <MarkdownPage url={contentsUrls.profile2} />
          </Route>
          <Route exact={true} path={routes.skills}>
            <MarkdownPage url={contentsUrls.skills} />
          </Route>
          <Route exact={true} path={routes.products}>
            <Products mobile={mobile} />
          </Route>
          <Route exact={true} path={routes.writings}>
            <Writings />
          </Route>
          <Route path='*'>
            <Redirect to={routes.profile} />
          </Route>
        </Switch>
      </ContentWrapper>
    </div>
  );
});
