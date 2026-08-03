import { type EndpointKeys } from 'octokit-safe-types';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';
import { type PagesSettings } from '../constants.mjs';
import { getPagesSettings } from './get-pages-settings.mjs';

/**
 * GitHub Pages の Source を JSON の内容に合わせる。
 *
 * Pages 未設定なら POST で作成し、設定済みなら PUT で更新する。 これにより
 * 「 Settings > Pages で Source を GitHub Actions に変更する 」という手作業が不要になる。
 */
export const setPagesSettings = async (
  settings: PagesSettings,
): Promise<void> => {
  const current = await getPagesSettings();

  if (current === undefined) {
    // https://docs.github.com/rest/pages/pages#create-a-apiname-pages-site
    await octokit.request(
      'POST /repos/{owner}/{repo}/pages' satisfies EndpointKeys,
      {
        owner: OWNER,
        repo: REPO,
        headers: octokitHeaders,
        build_type: settings.build_type,
      },
    );

    return;
  }

  if (current.build_type === settings.build_type) {
    return;
  }

  // https://docs.github.com/rest/pages/pages#update-information-about-a-apiname-pages-site
  await octokit.request(
    'PUT /repos/{owner}/{repo}/pages' satisfies EndpointKeys,
    {
      owner: OWNER,
      repo: REPO,
      headers: octokitHeaders,
      build_type: settings.build_type,
    },
  );
};
