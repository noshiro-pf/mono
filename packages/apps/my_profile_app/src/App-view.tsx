import { AppBar } from '@material-ui/core';
import { useNavigator, usePathNameList } from '@noshiro/react-router-utils';
import { memoNamed } from '@noshiro/react-utils';
import { last } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Redirect, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';
import { LastUpdated } from './components/last-updated';
import { Products } from './components/products/products';
import { Writings } from './components/writings/writings';
import { labelList, routeList, routes } from './constants/routes';
import ProfileMd from './contents/profile.md';
import Profile2Md from './contents/profile2.md';
import SkillsMd from './contents/skills.md';
import { MyTabs } from './utils/tabs';

const pathNameLastToIndex = (pathNameLast: string): number | undefined => {
  const res = routeList.findIndex((e) => e === `/${pathNameLast}`);
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
      if (0 <= tabIdx && tabIdx < routeList.length) {
        const route = routeList[tabIdx];
        if (route !== undefined) {
          navigator(route);
        }
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
          labels={labelList}
        />
      </AppBarFlex>

      <LastUpdatedWrapper>
        <LastUpdated />
      </LastUpdatedWrapper>

      <ContentWrapper>
        <Switch>
          <Route exact={true} path={routes.profile}>
            <ReactMarkdown source={ProfileMd} />
          </Route>
          <Route exact={true} path={routes.profile2}>
            <ReactMarkdown source={Profile2Md} />
          </Route>
          <Route exact={true} path={routes.skills}>
            <ReactMarkdown source={SkillsMd} />
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
