import { styled } from '@noshiro/goober';
import { useRouter } from '@noshiro/preact-router-utils';
import { memoNamed } from '@noshiro/preact-utils';
import { IList, match } from '@noshiro/ts-utils';
import Markdown from 'preact-markdown';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { Profile2Md, ProfileMd, SkillsMd } from './assets';
import {
  LastUpdated,
  MuiAppBar,
  MuiTabs,
  Products,
  Writings,
} from './components';
import { labelList, routeList, routes } from './constants';

const pathNameLastToIndex = (pathNameLast: string): number | undefined => {
  const res = routeList.findIndex((e) => e === `/${pathNameLast}/`);
  return res === -1 ? undefined : res;
};

export const App = memoNamed('App', () => {
  const { pathname, push, replace } = useRouter();

  const pathNameLast = useMemo(
    () => IList.last(pathname.split('/').filter((s) => s !== '')) ?? '',
    [pathname]
  );

  // pathnameと対応させるため、routerを使ってタブ切り替えを制御
  const tabIndex = useMemo(
    //
    () => pathNameLastToIndex(pathNameLast),
    [pathNameLast]
  );

  const tabIndexOnChange = useCallback(
    (tabIdx: number) => {
      if (IList.indexIsInRange(routeList, tabIdx)) {
        const route = routeList[tabIdx];
        if (route !== undefined) {
          push(route);
        }
      }
    },
    [push]
  );

  useEffect(() => {
    if (tabIndex === undefined) {
      replace(routes.profile);
    }
  }, [pathname, tabIndex, replace]);

  return (
    <Root>
      <AppBarFlex>
        <MuiTabs
          labels={labelList}
          scrollable={true}
          tabIndex={tabIndex ?? 0}
          tabIndexChange={tabIndexOnChange}
        />
      </AppBarFlex>

      <LastUpdatedWrapper>
        <LastUpdated />
      </LastUpdatedWrapper>

      <ContentWrapper>
        {match(pathname, {
          [routes.profile]: Markdown(ProfileMd),
          [routes.profile2]: Markdown(Profile2Md),
          [routes.skills]: Markdown(SkillsMd),
          [routes.products]: <Products />,
          [routes.writings]: <Writings />,
        })}
      </ContentWrapper>
    </Root>
  );
});

const Root = styled('div')`
  min-height: 100vh;
`;

const LastUpdatedWrapper = styled('div')`
  padding: 10px 15px 0 0;
  display: flex;
  justify-content: flex-end;
`;

const ContentWrapper = styled('div')`
  padding: 0 20px 20px 20px;

  overflow: auto;
`;

const AppBarFlex = styled(MuiAppBar)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;
