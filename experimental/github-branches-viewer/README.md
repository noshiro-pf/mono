<!--
Provenance note added on import. Everything below the horizontal rule is the
original README, verbatim.
-->

> **Archived copy — nothing here is wired into this repository.**
>
> Imported verbatim from the standalone repository
> <https://github.com/noshiro-pf/github-branches-viewer> at commit
> `0f356e27de7e8dae55239d051620d37e8e017d88` (2026-07-20), which is being
> deleted now that the content lives here. This note is the only addition.
>
> **The commit is the tip of `develop`, not of `main`.** Development happened on
> `develop`, which was 26 commits ahead of `main` and behind it by none; the
> repository's one pull request was merged into `develop` as well. `main` still
> held the first version — a single static `index.html` driving iframes from a
> hard-coded `script.js` — which this React rewrite replaced, deleting
> `script.js` and `style.css` outright. Only `develop` is imported: it contains
> `main`'s history in full, and the static page it superseded is of no use on its
> own.
>
> It lives under `experimental/`, which is outside the pnpm workspace globs and
> excluded from ESLint, tsc, knip, Prettier, cspell and markdownlint. So its
> `package.json`, lockfile, `.github/workflows/deploy.yml`, `configs/`,
> `eslint.config.js` and `vite.config.js` are inert: nothing here is installed,
> built, checked or deployed, and the setup instructions below describe the
> standalone repository rather than anything you can do from this one. Running
> it means installing it somewhere of its own — it is a Vite app with real
> dependencies, not a page you can open from the filesystem.
>
> One thing to know before reviving it: which repositories it shows comes from
> `VITE_ADDITIONAL_REPOS` (comma-separated `owner/repo`), and the only built-in
> entry is the `FALLBACK_REPOSITORY` in `src/app.tsx` — this repository itself,
> which is the one being deleted. Set the environment variable, or change that
> constant, or it opens on a repository that is no longer there. The GitHub API
> is called from the browser, optionally with a `VITE_GITHUB_TOKEN` to raise the
> rate limit; both variables are documented in `.env.example`.

---

# GitHub Branches & README Viewer

A React-based web application that displays GitHub repository branches, pull requests, CI status, and README files in a clean, tabbed interface. Built with modern web technologies including React 19, TypeScript, and Vite.

## Features

- **Multi-Repository Support**: View multiple GitHub repositories in a tabbed interface
- **Branch Information**: Display all branches with commit details, timestamps, and author information
- **CI Status Integration**: Show GitHub Actions check status for each branch
- **Pull Request Links**: Direct links to associated pull requests
- **Branch Comparison**: Compare branches against the default branch with file change counts
- **README Rendering**: Syntax-highlighted README files with GitHub-flavored markdown
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **URL State Management**: Shareable URLs with tab and theme state
- **Rate Limit Monitoring**: GitHub API rate limit status display
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7.x
- **HTTP Client**: Axios
- **Syntax Highlighting**: @wooorm/starry-night
- **Styling**: CSS modules with custom properties for theming
- **Testing**: Playwright for visual regression testing
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/noshiro-pf/github-branches-viewer.git
    cd github-branches-viewer
    ```

2. Install dependencies:

    ```bash
    pnpm install
    ```

3. Create environment file:

    ```bash
    cp .env.example .env
    ```

4. Configure GitHub API access in `.env`:

    ```
    # Optional: GitHub Personal Access Token for higher rate limits
    VITE_GITHUB_TOKEN=your_github_token_here

    # Optional: Additional repositories to display (comma-separated)
    VITE_ADDITIONAL_REPOS=owner1/repo1,owner2/repo2
    ```

5. Start development server:
    ```bash
    pnpm run dev
    ```

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run check` - Run type checking and linting
- `pnpm run lint` - Run ESLint
- `pnpm run fmt` - Format code with Prettier
- `pnpm run test:visual` - Run Playwright visual tests
- `pnpm run tsc` - Type check without emitting

## Deployment

Pushes to the `main` branch automatically build and deploy the site to GitHub Pages via the workflow in `.github/workflows/deploy.yml`. The build step sets `GITHUB_PAGES=true` so Vite outputs assets scoped to the repository path. To verify the production output locally, run `GITHUB_PAGES=true pnpm run build` followed by `pnpm run preview`.

## Configuration

### Adding Repositories

Repositories can be added by modifying the `buildRepositoriesList` function in `src/App.tsx` or by setting the `VITE_ADDITIONAL_REPOS` environment variable.

### GitHub API Token

While the app works without authentication, providing a GitHub token increases the API rate limit from 60 to 5000 requests per hour.

## Project Structure

```
src/
├── components/          # React components
│   ├── GitHubBranches.tsx      # Main branch listing component
│   ├── RepositoryViewer.tsx    # Repository container component
│   ├── ReadmeSectionBody.tsx   # README renderer
│   ├── CheckStatus.tsx         # CI status display
│   ├── RateLimitStatus.tsx     # API rate limit monitor
│   └── LoadingSkeleton.tsx     # Loading placeholders
├── types/               # TypeScript type definitions
├── utils/               # API utilities and helpers
├── styles/              # Global styles and themes
└── App.tsx              # Main application component
```

## License

This project is open source and available under the MIT License.
