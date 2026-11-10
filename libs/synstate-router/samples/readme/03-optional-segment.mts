import {
  defineRoutes,
  matchRoutes,
  param,
  type Href,
  type RouteMatch,
} from 'synstate-router';

if (import.meta.vitest !== undefined) {
  test('README: an optional segment', () => {
    // embed-sample-code-ignore-above

    // `/about/` and `/ja/about/`: one page with and without a locale prefix,
    // written as two nodes.
    const routes = defineRoutes({
      about: {},
      localized: {
        params: { lang: param.literal('ja', 'fr') },
        page: false,
        children: { about: {} },
      },
    });

    type Lang = 'en' | 'ja' | 'fr';

    // The one place that tells the two apart; a `Routes` case for each node
    // draws the same page with it.
    const langOf = (m: RouteMatch<typeof routes>): Lang =>
      m.route === 'localized.about' ? m.params.lang : 'en';

    const aboutHref = (lang: Lang): Href =>
      lang === 'en'
        ? routes.about.href()
        : routes.localized.about.href({ lang });

    assert.strictEqual(aboutHref('en'), '/about/');

    assert.strictEqual(aboutHref('ja'), '/ja/about/');

    assert.strictEqual(
      langOf(matchRoutes(routes, { pathname: '/fr/about/' })),
      'fr',
    );

    assert.strictEqual(
      langOf(matchRoutes(routes, { pathname: '/about/' })),
      'en',
    );

    // embed-sample-code-ignore-below
  });
}
