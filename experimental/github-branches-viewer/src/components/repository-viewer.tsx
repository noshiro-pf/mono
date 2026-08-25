import { memo, useCallback } from 'react';
import { type Repository } from '../types';
import { GitHubBranches } from './github-branches';
import { ReadmeSectionBody } from './readme-section-body';
import './repository-viewer.css';

type RepositoryViewerProps = Readonly<{
  repository: Repository;
}>;

export const RepositoryViewer = memo<RepositoryViewerProps>((props) => {
  const { repository } = props;
  const handleGitHubRefresh = useCallback(() => {
    console.log('GitHub data refreshed');
  }, []);

  const handleReadmeRefresh = useCallback(() => {
    console.log('README data refreshed');
  }, []);

  return (
    <div className={'repository-viewer'}>
      <section className={'github-section'} id={'github-branches'}>
        <GitHubBranches
          repository={repository}
          onRefresh={handleGitHubRefresh}
        />
      </section>

      <section className={'readme-section'} id={'readme'}>
        <ReadmeSectionBody
          repository={repository}
          onRefresh={handleReadmeRefresh}
        />
      </section>
    </div>
  );
});

RepositoryViewer.displayName = 'RepositoryViewer';
