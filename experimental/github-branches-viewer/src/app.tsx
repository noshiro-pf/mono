import {
  memo,
  type MouseEventHandler,
  useCallback,
  useEffect,
  useState,
} from 'react';
import './app.css';
import {
  RateLimitStatus,
  RepositoryViewer,
  TableOfContents,
} from './components';
import { type Repository } from './types';

const FALLBACK_REPOSITORY: Repository = {
  id: 'github-branches-viewer',
  name: 'github-branches-viewer',
  owner: 'noshiro-pf',
};

const APP_TITLE = 'GitHub Branches & README Viewer';

// Parse additional repositories from environment variables
const parseAdditionalRepos = (): Repository[] => {
  // Look for VITE_ADDITIONAL_REPOS environment variable
  // Format: "owner/repo1,owner/repo2,owner/repo3"
  const additionalReposEnv = import.meta.env.VITE_ADDITIONAL_REPOS;
  if (
    typeof additionalReposEnv !== 'string' ||
    additionalReposEnv.trim() === ''
  ) {
    return [];
  }

  return additionalReposEnv
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((repoString) => {
      const [ownerRaw, repoRaw] = repoString.split('/');
      if (ownerRaw === undefined || repoRaw === undefined) {
        return null;
      }

      const owner = ownerRaw.trim();
      const repoName = repoRaw.trim();

      if (owner === '' || repoName === '') {
        return null;
      }

      return {
        id: `${owner}-${repoName}`,
        name: repoName,
        owner,
      };
    })
    .filter((repo): repo is Repository => repo !== null);
};

// Build complete repositories list
const buildRepositoriesList = (): Repository[] => {
  // Default repositories (with github-branches-viewer first)
  const defaultRepos: Repository[] = [
    FALLBACK_REPOSITORY,
    {
      id: 'typescript-monorepo-template',
      name: 'typescript-monorepo-template',
      owner: 'noshiro-pf',
    },
    {
      id: 'typescript-template',
      name: 'typescript-template',
      owner: 'noshiro-pf',
    },
    {
      id: 'eslint-config-typed',
      name: 'eslint-config-typed',
      owner: 'noshiro-pf',
    },
    {
      id: 'ts-repo-utils',
      name: 'ts-repo-utils',
      owner: 'noshiro-pf',
    },
    {
      id: 'ts-type-forge',
      name: 'ts-type-forge',
      owner: 'noshiro-pf',
    },
    {
      id: 'ts-data-forge',
      name: 'ts-data-forge',
      owner: 'noshiro-pf',
    },
    {
      id: 'ts-fortress',
      name: 'ts-fortress',
      owner: 'noshiro-pf',
    },
    {
      id: 'octokit-safe-types',
      name: 'octokit-safe-types',
      owner: 'noshiro-pf',
    },
    {
      id: 'mono',
      name: 'mono',
      owner: 'noshiro-pf',
    },
  ];

  // Parse additional repositories from environment
  const additionalRepos = parseAdditionalRepos();

  // Return combined list (default repos + additional repos)
  return [...defaultRepos, ...additionalRepos];
};

const repositories = buildRepositoriesList();
const fallbackRepository: Repository = repositories[0] ?? FALLBACK_REPOSITORY;

// Initialize tab from query parameter or default to first repository
const getInitialTab = (): string => {
  const params = new URLSearchParams(globalThis.location.search);
  const tabFromUrl = params.get('tab');
  if (tabFromUrl !== null) {
    const validTab = repositories.find((repo) => repo.id === tabFromUrl);
    if (validTab !== undefined) {
      return tabFromUrl;
    }
  }

  return fallbackRepository.id;
};

// Initialize dark mode from query parameter, localStorage, or system preference
const getInitialDarkMode = (): boolean => {
  const params = new URLSearchParams(globalThis.location.search);
  const darkFromUrl = params.get('dark');
  if (darkFromUrl !== null) {
    return darkFromUrl === 'true';
  }
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) {
    const parsed: unknown = JSON.parse(saved);
    if (typeof parsed === 'boolean') {
      return parsed;
    }
    return false;
  }
  if (typeof globalThis.matchMedia === 'function') {
    return globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

// Initialize vertical layout from localStorage or default to false (horizontal)
const getInitialVerticalLayout = (): boolean => {
  const saved = localStorage.getItem('verticalLayout');
  if (saved !== null) {
    const parsed: unknown = JSON.parse(saved);
    if (typeof parsed === 'boolean') {
      return parsed;
    }
    return false;
  }
  return false;
};

export const App = memo(() => {
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [darkMode, setDarkMode] = useState(getInitialDarkMode());
  const [verticalLayout, setVerticalLayout] = useState(
    getInitialVerticalLayout(),
  );

  // Update URL when tab changes
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    const url = new URL(globalThis.location.href);
    url.searchParams.set('tab', tabId);
    globalThis.history.pushState({}, '', url);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));

    // Update URL with dark mode parameter
    const url = new URL(globalThis.location.href);
    if (newDarkMode) {
      url.searchParams.set('dark', 'true');
    } else {
      url.searchParams.delete('dark');
    }
    globalThis.history.pushState({}, '', url);
  }, [darkMode]);

  // Toggle vertical layout
  const toggleVerticalLayout = useCallback(() => {
    const newVerticalLayout = !verticalLayout;
    setVerticalLayout(newVerticalLayout);
    localStorage.setItem('verticalLayout', JSON.stringify(newVerticalLayout));
  }, [verticalLayout]);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = (): void => {
      const params = new URLSearchParams(globalThis.location.search);

      // Handle tab parameter
      const tabFromUrl = params.get('tab');
      if (tabFromUrl !== null) {
        const validTab = repositories.find((repo) => repo.id === tabFromUrl);
        if (validTab !== undefined) {
          setActiveTab(tabFromUrl);
        } else {
          setActiveTab(fallbackRepository.id);
        }
      } else {
        setActiveTab(fallbackRepository.id);
      }

      // Handle dark mode parameter
      const darkFromUrl = params.get('dark');
      if (darkFromUrl !== null) {
        const newDarkMode = darkFromUrl === 'true';
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
      }
    };

    globalThis.addEventListener('popstate', handlePopState);
    return () => {
      globalThis.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const activeRepository =
    repositories.find((repo) => repo.id === activeTab) ?? fallbackRepository;
  const repositoryViewer = (
    <RepositoryViewer key={activeTab} repository={activeRepository} />
  );

  const handleTabLinkClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
    (mouseEvent) => {
      if (mouseEvent.ctrlKey || mouseEvent.metaKey || mouseEvent.shiftKey) {
        return;
      }

      const { repoId } = mouseEvent.currentTarget.dataset;
      if (repoId === undefined) {
        return;
      }

      mouseEvent.preventDefault();
      handleTabChange(repoId);
    },
    [handleTabChange],
  );

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <header className={'app-header'}>
        <h1>{APP_TITLE}</h1>
        <div className={'header-controls'}>
          <button
            aria-label={
              verticalLayout
                ? 'Switch to horizontal layout'
                : 'Switch to vertical layout'
            }
            className={'layout-toggle'}
            title={
              verticalLayout
                ? 'Switch to horizontal layout'
                : 'Switch to vertical layout'
            }
            type={'button'}
            onClick={toggleVerticalLayout}
          >
            {verticalLayout ? (
              <svg
                fill={'currentColor'}
                height={'20'}
                viewBox={'0 0 24 24'}
                width={'20'}
              >
                <path
                  d={'M3 12h18M3 6h18M3 18h18'}
                  stroke={'currentColor'}
                  strokeLinecap={'round'}
                  strokeWidth={'2'}
                />
              </svg>
            ) : (
              <svg
                fill={'currentColor'}
                height={'20'}
                viewBox={'0 0 24 24'}
                width={'20'}
              >
                <path
                  d={'M12 3v18M6 3v18M18 3v18'}
                  stroke={'currentColor'}
                  strokeLinecap={'round'}
                  strokeWidth={'2'}
                />
              </svg>
            )}
          </button>
          <button
            aria-label={
              darkMode ? 'Switch to light mode' : 'Switch to dark mode'
            }
            className={'dark-mode-toggle'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            type={'button'}
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <svg
                fill={'currentColor'}
                height={'20'}
                viewBox={'0 0 24 24'}
                width={'20'}
              >
                <path
                  d={
                    'M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z'
                  }
                />
              </svg>
            ) : (
              <svg
                fill={'currentColor'}
                height={'20'}
                viewBox={'0 0 24 24'}
                width={'20'}
              >
                <path
                  d={
                    'M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z'
                  }
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {verticalLayout ? (
        <div className={'app-body vertical-layout'}>
          <nav className={'sidebar-navigation'}>
            {repositories.map((repo) => (
              <a
                key={repo.id}
                className={`sidebar-tab ${activeTab === repo.id ? 'active' : ''}`}
                data-repo-id={repo.id}
                href={`?tab=${repo.id}`}
                title={repo.name}
                onClick={handleTabLinkClick}
              >
                <span className={'sidebar-tab-text'}>{repo.name}</span>
              </a>
            ))}
          </nav>

          <main className={'main-content'}>
            <div className={'tab-content active'}>{repositoryViewer}</div>
          </main>
        </div>
      ) : (
        <>
          <nav className={'tab-navigation'}>
            {repositories.map((repo) => (
              <a
                key={repo.id}
                className={`tab-button ${activeTab === repo.id ? 'active' : ''}`}
                data-repo-id={repo.id}
                href={`?tab=${repo.id}`}
                title={repo.name}
                onClick={handleTabLinkClick}
              >
                <span className={'tab-button-text'}>{repo.name}</span>
              </a>
            ))}
          </nav>

          <main className={'main-content'}>
            <div className={'tab-content active'}>{repositoryViewer}</div>
          </main>
        </>
      )}

      <TableOfContents />
      <RateLimitStatus />
    </div>
  );
});

App.displayName = 'App';
