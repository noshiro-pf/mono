import core from '@actions/core';
import { exec, execSync } from 'node:child_process';
import packageJson from '../package.json' with { type: 'json' };

const gitUserEmail = 'actions@github.com';

const gitUserName = 'github-actions[bot]';

const release = async () => {
  try {
    core.info('Starting release process...');

    // Gitユーザー設定
    await execAsync(`git config user.name "${gitUserName}"`);
    await execAsync(`git config user.email "${gitUserEmail}"`);

    // package.json からバージョンを取得
    const version = packageJson.version;
    const tagName = `v${version}`;
    core.info(`Releasing version ${version} (${tagName})`);

    // 1. npm publish
    const npmToken = core.getInput('npm-token', { required: true });
    core.setSecret(npmToken); // トークンをマスク
    core.info('Publishing to npm...');
    // .npmrc にトークンを設定
    await execAsync(
      `echo "//registry.npmjs.org/:_authToken=${npmToken}" > .npmrc`,
    );
    await execAsync('npm publish');
    core.info('Successfully published to npm.');
    await execAsync('rm .npmrc'); // 一時ファイルを削除

    // 2. Git タグを push
    core.info(`Checking if tag ${tagName} exists...`);
    try {
      await execAsync(`git rev-parse ${tagName}`);
      core.info(`Tag ${tagName} already exists. Skipping tag creation.`);
    } catch {
      core.info(`Tag ${tagName} does not exist. Creating tag...`);
      await execAsync(`git tag ${tagName}`);
      core.info(`Pushing tag ${tagName}...`);
      await execAsync(`git push origin ${tagName}`);
      core.info(`Tag ${tagName} pushed successfully.`);
    }

    // 3. GitHub Release Note を更新
    const githubToken = core.getInput('github-token', { required: true });
    core.setSecret(githubToken); // トークンをマスク
    core.info('Creating/Updating GitHub Release Note...');
    // conventional-github-releaser を実行
    // 環境変数にトークンを設定して実行
    try {
      // preset は angular (または利用している規約) に合わせる
      execSync(`npx conventional-github-releaser -p angular --pkg .`, {
        env: {
          ...process.env, // 既存の環境変数を引き継ぐ
          CONVENTIONAL_GITHUB_RELEASER_TOKEN: githubToken,
        },
      });
      core.info('GitHub Release Note created/updated successfully.');
    } catch (error) {
      core.warning(
        `conventional-github-releaser failed: ${JSON.stringify(error)}. This might happen if the tag was just created.`,
      );
      // リリースが既に存在する場合などにエラーになることがあるため warning に留める場合も
      // 必要に応じてエラーハンドリングを調整
    }

    core.info('Release process completed successfully.');
  } catch (error) {
    core.setFailed(`Release failed: ${JSON.stringify(error)}`);
    console.error(error); // エラー詳細をログに出力
    // 必要なら npm publish 後のタグ作成失敗などでロールバック処理を追加
  }
};

await release();

/**
 * @param {string} cmd
 * @returns {Promise<string>}
 */
const execAsync = (cmd) =>
  new Promise((resolve, _reject) => {
    exec(cmd, (_error, stdout) => {
      resolve(stdout);
    });
  });
