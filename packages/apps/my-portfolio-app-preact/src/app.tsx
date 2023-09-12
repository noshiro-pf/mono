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
import { Router } from './router';

const pathNameLastToIndex = (pathNameLast: string): number | undefined => {
  // eslint-disable-next-line unicorn/prefer-array-index-of
  const res = routeList.findIndex((e) => e === `/${pathNameLast}/`);
  return res === -1 ? undefined : res;
};

const tabIndexOnChange = (tabIdx: number): void => {
  if (Arr.indexIsInRange(routeList, toSafeUint(tabIdx))) {
    const route = routeList[tabIdx];
    if (route !== undefined) {
      Router.push(route);
    }
  }
};

const LiSpacedBlock = styled('div')`
  li {
    margin: 7px 0;
  }
`;

const pages = {
  [routes.career]: (
    <LiSpacedBlock>
      <CareerMd />
    </LiSpacedBlock>
  ),
  [routes.biography]: (
    <LiSpacedBlock>
      <BiographyMd />
    </LiSpacedBlock>
  ),
  [routes.skills]: <SkillsMd />,
  [routes.products]: <Products />,
  [routes.writings]: <Writings />,
};

export const App = memoNamed('App', () => {
  const { pathname } = useObservableValue(Router.state$);

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
      Router.redirect(routes.career);
    }
  }, [pathname, tabIndex]);

  return (
    <Root data-cy={'root'}>
      <AppBarFlex>
        <IconButtons>
          <IconButton title={'ねこかわいい'}>
            <ImgStyled src={CatIconImage} />
          </IconButton>
        </IconButtons>

        <div data-cy={'tabs'}>
          <MuiTabs
            labels={labelList}
            scrollable={true}
            tabIndex={tabIndex ?? 0}
            tabIndexChange={tabIndexOnChange}
          />
        </div>

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
