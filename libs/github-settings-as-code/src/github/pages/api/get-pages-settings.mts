import { type EndpointKeys } from 'octokit-safe-types';
import { hasKey, isRecord } from 'ts-data-forge';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';
import { PagesSettings } from '../constants.mjs';

/**
 * GitHub Pages の現在の設定を取得する。
 *
 * Pages が未設定の repository では 404 が返るため、その場合は `undefined` を返す。
 */
export const getPagesSettings = async (): Promise<
  PagesSettings | undefined
> => {
  try {
    // https://docs.github.com/rest/pages/pages#get-a-apiname-pages-site
    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/pages' satisfies EndpointKeys,
      { owner: OWNER, repo: REPO, headers: octokitHeaders },
    );

    // eslint-disable-next-line unicorn/no-array-fill-with-reference-type
    return PagesSettings.fill({ build_type: response.data.build_type });
  } catch (error) {
    if (isRecord(error) && hasKey(error, 'status') && error.status === 404) {
      return undefined;
    }

    throw error;
  }
};
