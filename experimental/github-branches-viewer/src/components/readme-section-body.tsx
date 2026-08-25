import { createStarryNight } from '@wooorm/starry-night';
import 'github-markdown-css/github-markdown.css';
import { toHtml } from 'hast-util-to-html';
import { memo, useCallback, useEffect, useState } from 'react';
import { type Repository } from '../types';
import { fetchReadmeAsHtml } from '../utils/api';
import './readme-section-body.css';

type Props = Readonly<{
  repository: Repository;
  onRefresh?: () => void;
}>;

export const ReadmeSectionBody = memo(({ repository, onRefresh }: Props) => {
  // Check if we're in dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (globalThis.window !== undefined) {
      return (
        document.documentElement.classList.contains('dark') ||
        document.body.closest('.dark') !== null
      );
    }
    return false;
  });
  const [readmeHtml, setReadmeHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [starryNight, setStarryNight] = useState<Awaited<
    ReturnType<typeof createStarryNight>
  > | null>(null);

  // Initialize starry-night
  useEffect(() => {
    const initStarryNight = async () => {
      try {
        // Import common grammars dynamically
        const [
          sourceJs,
          sourceTs,
          sourcePython,
          sourceJava,
          sourceCss,
          sourceHtml,
          sourceJson,
          sourceMd,
          sourceShell,
          sourceYaml,
        ] = await Promise.all([
          import(
            /* webpackChunkName: "starry-night-js" */ '@wooorm/starry-night/source.js'
          ),
          import(
            /* webpackChunkName: "starry-night-ts" */ '@wooorm/starry-night/source.ts'
          ),
          import(
            /* webpackChunkName: "starry-night-python" */ '@wooorm/starry-night/source.python'
          ),
          import(
            /* webpackChunkName: "starry-night-java" */ '@wooorm/starry-night/source.java'
          ),
          import(
            /* webpackChunkName: "starry-night-css" */ '@wooorm/starry-night/source.css'
          ),
          import(
            /* webpackChunkName: "starry-night-html" */ '@wooorm/starry-night/text.html.basic'
          ),
          import(
            /* webpackChunkName: "starry-night-json" */ '@wooorm/starry-night/source.json'
          ),
          import(
            /* webpackChunkName: "starry-night-md" */ '@wooorm/starry-night/text.md'
          ),
          import(
            /* webpackChunkName: "starry-night-shell" */ '@wooorm/starry-night/source.shell'
          ),
          import(
            /* webpackChunkName: "starry-night-yaml" */ '@wooorm/starry-night/source.yaml'
          ),
        ]);

        const starryNightInstance = await createStarryNight([
          sourceJs.default,
          sourceTs.default,
          sourcePython.default,
          sourceJava.default,
          sourceCss.default,
          sourceHtml.default,
          sourceJson.default,
          sourceMd.default,
          sourceShell.default,
          sourceYaml.default,
        ]);

        setStarryNight(starryNightInstance);
      } catch (error) {
        console.warn('Failed to initialize starry-night:', error);
      }
    };

    void initStarryNight();
  }, []);

  // Monitor dark mode changes
  useEffect(() => {
    if (globalThis.window === undefined) return;

    const observer = new MutationObserver(() => {
      const newIsDarkMode =
        document.documentElement.classList.contains('dark') ||
        document.body.closest('.dark') !== null;
      setIsDarkMode(newIsDarkMode);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Also observe body for .dark class changes
    const bodyObserver = new MutationObserver(() => {
      const newIsDarkMode =
        document.documentElement.classList.contains('dark') ||
        document.body.closest('.dark') !== null;
      setIsDarkMode(newIsDarkMode);
    });

    if (document.body.parentElement !== null) {
      bodyObserver.observe(document.body.parentElement, {
        attributes: true,
        attributeFilter: ['class'],
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      bodyObserver.disconnect();
    };
  }, []);

  const loadReadme = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        const htmlContent = await fetchReadmeAsHtml(
          repository.owner,
          repository.name,
          forceRefresh,
        );

        if (htmlContent !== null) {
          setReadmeHtml(htmlContent);
        } else {
          setError('README not found');
        }
      } catch (error_) {
        setError((error_ as Error).message ?? 'Failed to fetch README');
        console.error('Error fetching README:', error_);
      } finally {
        setLoading(false);
      }
    },
    [repository.owner, repository.name],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadReadme(true);
      if (onRefresh !== null && onRefresh !== undefined) {
        onRefresh();
      }
    } finally {
      setRefreshing(false);
    }
  }, [loadReadme, onRefresh]);

  useEffect(() => {
    void loadReadme();
  }, [loadReadme]);

  // Post-process HTML: add syntax highlighting and fix external links
  useEffect(() => {
    if (readmeHtml !== null && starryNight !== null) {
      const processHTML = () => {
        const readmeContainer = document.querySelector('.readme-content');
        if (readmeContainer === null) return;

        // Add target="_blank" to external links
        const externalLinks = readmeContainer.querySelectorAll(
          'a[href^="http"]:not([href*="github.com"])',
        );
        for (const link of externalLinks) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }

        // Apply syntax highlighting to code blocks
        const codeBlocks = readmeContainer.querySelectorAll(
          'pre code[class*="language-"]',
        );
        for (const codeElement of codeBlocks) {
          const pre = codeElement.parentElement;
          if (pre === null) continue;

          // Extract language from class
          const classList = Array.from(codeElement.classList);
          const languageClass = classList.find((cls) =>
            cls.startsWith('language-'),
          );
          if (languageClass === undefined) continue;

          const language = languageClass.replace('language-', '');
          const code = codeElement.textContent ?? '';

          try {
            // Check if starry-night supports this language
            const scope = starryNight.flagToScope(language);
            if (scope !== null && scope !== undefined) {
              const tree = starryNight.highlight(code, scope);
              // Convert AST to HTML and replace the content
              const htmlString = toHtml(tree);
              codeElement.innerHTML = htmlString;
              codeElement.classList.add('starry-night');
            }
          } catch (error) {
            console.warn(`Failed to highlight ${language}:`, error);
          }
        }
      };

      // Process after a small delay to ensure DOM is ready
      setTimeout(processHTML, 0);
    }
  }, [readmeHtml, starryNight]);

  if (loading) {
    return (
      <div className={'readme-loading'}>{'Loading README information...'}</div>
    );
  }

  if (error) {
    return (
      <div className={'readme-error'}>
        {'Error loading README info: '}
        {error}
      </div>
    );
  }

  if (readmeHtml === null && !loading) {
    return <div className={'readme-not-found'}>{'README not found'}</div>;
  }

  return (
    <div className={'readme-package-info'}>
      <div className={'readme-header'}>
        <a
          className={'readme-section-title readme-title-link'}
          href={`https://github.com/${repository.owner}/${repository.name}#readme`}
          rel={'noopener noreferrer'}
          target={'_blank'}
        >
          {'README'}
        </a>
        <button
          className={'refresh-btn'}
          disabled={refreshing}
          onClick={handleRefresh}
          title={'Refresh README data'}
          type={'button'}
        >
          <svg
            className={refreshing ? 'rotating' : ''}
            fill={'currentColor'}
            height={'16'}
            viewBox={'0 0 16 16'}
            width={'16'}
          >
            <path
              d={
                'M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z'
              }
            />
          </svg>
          {refreshing ? (
            <span className={'refresh-text'}>{'Refreshing...'}</span>
          ) : null}
        </button>
      </div>

      {readmeHtml ? (
        <div
          dangerouslySetInnerHTML={{ __html: readmeHtml }}
          className={'readme-content markdown-body'}
          data-color-mode={isDarkMode ? 'dark' : 'light'}
          data-dark-theme={'dark'}
        />
      ) : (
        <div className={'no-readme'}>
          <p>{'No README found for this repository.'}</p>
        </div>
      )}
    </div>
  );
});

ReadmeSectionBody.displayName = 'ReadmeSectionBody';
