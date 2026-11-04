import { constant, If, view, type JSX } from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';
import * as styles from './app.module.css';
import {
  BiographyMdx,
  CareerMdx,
  CatIconImage,
  SkillsMdx,
} from './assets/index.mjs';
import {
  IconLink,
  LastUpdatedAt,
  MuiTabs,
  Products,
  Writings,
} from './components/index.mjs';
import { accounts, labelList, tabKeys } from './constants/index.mjs';
import { selectTab, tabIndex$ } from './router.mjs';

export const App = (): JSX.Element => (
  <div class={constant(styles.root)} data-e2e={constant('root')}>
    <header class={constant(styles.appBar)}>
      <div class={constant(styles.iconButtons)}>
        <div
          class={constant(styles.iconButton)}
          title={constant('ねこかわいい')}
        >
          <img
            alt={constant('')}
            class={constant(styles.catIcon)}
            src={constant(CatIconImage)}
          />
        </div>
      </div>

      <div data-e2e={constant('tabs')}>
        <MuiTabs
          labels={labelList}
          tabIndex={tabIndex$}
          tabIndexChange={selectTab}
        />
      </div>

      <div class={constant(styles.iconButtons)}>
        {accounts.map((account) => (
          <div
            class={constant(styles.iconButton)}
            title={constant(account.href)}
          >
            <IconLink {...account} />
          </div>
        ))}
      </div>
    </header>

    <div class={constant(styles.lastUpdated)}>
      <LastUpdatedAt />
    </div>

    <div class={constant(styles.content)}>
      {tabKeys.map((key, index) => (
        <If
          cond={view(tabIndex$, (selected) => selected === index)}
          then={pages[key]}
        />
      ))}
    </div>
  </div>
);

/**
 * What each tab shows. These are descriptions: `If` builds one only while its
 * tab is selected.
 */
const pages = {
  career: (
    <div class={constant(styles.liSpaced)}>
      <CareerMdx />
    </div>
  ),
  biography: (
    <div class={constant(styles.liSpaced)}>
      <BiographyMdx />
    </div>
  ),
  skills: <SkillsMdx />,
  products: <Products />,
  writings: <Writings />,
} as const satisfies ReadonlyRecord<(typeof tabKeys)[number], JSX.Element>;
