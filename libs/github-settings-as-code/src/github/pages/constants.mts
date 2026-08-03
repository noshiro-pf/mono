import * as t from 'ts-fortress';

/**
 * `github/pages/settings.json` の型。
 *
 * Settings > Pages > Build and deployment > Source に対応する。
 * `workflow` が GUI 上の「 GitHub Actions 」、 `legacy` が「 Deploy from a branch 」。
 */
export const PagesSettings = t.record({
  build_type: t.enumType(['workflow', 'legacy'], {
    typeName: 'PagesBuildType',
    defaultValue: 'workflow',
  }),
});

export type PagesSettings = t.TypeOf<typeof PagesSettings>;
