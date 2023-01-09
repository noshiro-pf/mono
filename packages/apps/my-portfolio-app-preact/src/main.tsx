import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';
import { push, redirect, usePathname } from '@noshiro/tiny-router-preact-hooks';
import Markdown from 'preact-markdown';
import { useEffect, useMemo } from 'preact/hooks';
import { BiographyMd, CareerMd, CatIconImage, SkillsMd } from './assets';
import {
  GithubIconLink,
  LastUpdatedAt,
  MuiAppBar,
  MuiTabs,
  Products,
  TwitterIconLink,
  Writings,
} from './components';
import { labelList, links, routeList, routes } from './constants';

const pathNameLastToIndex = (pathNameLast: string): number | undefined => {
  // eslint-disable-next-line unicorn/prefer-array-index-of
  const res = routeList.findIndex((e) => e === `/${pathNameLast}/`);
  return res === -1 ? undefined : res;
};

const tabIndexOnChange = (tabIdx: number): void => {
  if (Arr.indexIsInRange(routeList, tabIdx)) {
    const route = routeList[tabIdx];
    if (route !== undefined) {
      push(route);
    }
  }
};

const LiSpacedBlock = styled('div')`
  li {
    margin: 7px 0;
  }
`;

const pages = {
  [routes.career]: <LiSpacedBlock>{Markdown(CareerMd)}</LiSpacedBlock>,
  [routes.biography]: <LiSpacedBlock>{Markdown(BiographyMd)}</LiSpacedBlock>,
  [routes.skills]: Markdown(SkillsMd),
  [routes.products]: <Products />,
  [routes.writings]: <Writings />,
};

export const Main = memoNamed('Main', () => {
  const pathname = usePathname();

  const pathNameLast = useMemo(
    () => Arr.last(pathname.split('/').filter((s) => s !== '')) ?? '',
    [pathname]
  );

  // pathnameと対応させるため、routerを使ってタブ切り替えを制御
  const tabIndex = useMemo(
    //
    () => pathNameLastToIndex(pathNameLast),
    [pathNameLast]
  );

  useEffect(() => {
    if (tabIndex === undefined) {
      redirect(routes.career);
    }
  }, [pathname, tabIndex]);

  return (
    <Root>
      <AppBarFlex>
        <IconButtons>
          <IconButton title={'ねこかわいい'}>
            <ImgStyled src={CatIconImage} />
          </IconButton>
        </IconButtons>

        <MuiTabs
          labels={labelList}
          scrollable={true}
          tabIndex={tabIndex ?? 0}
          tabIndexChange={tabIndexOnChange}
        />

        <IconButtons>
          <IconButton title={links.twitter}>
            <TwitterIconLink />
          </IconButton>
          <IconButton title={links.github}>
            <GithubIconLink />
          </IconButton>
        </IconButtons>
      </AppBarFlex>

      <LastUpdatedWrapper>
        <LastUpdatedAt />
      </LastUpdatedWrapper>

      <ContentWrapper>{match(pathname, pages)}</ContentWrapper>
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

  max-width: 100vw;
  text-overflow: ellipsis;
  overflow-x: hidden;
`;

const AppBarFlex = styled(MuiAppBar)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const IconButtons = styled('div')`
  display: flex;
  margin-right: 20px;
`;

const IconButton = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 8px;
`;

const ImgStyled = styled('img')`
  width: 32px;
  object-fit: contain;
  border-radius: 50%;
`;
