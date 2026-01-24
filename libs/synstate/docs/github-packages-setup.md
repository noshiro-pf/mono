# GitHub Packages Setup

This document explains how to set up and publish packages to GitHub Packages Registry.

## Current Configuration

Your repository is already configured to publish packages to GitHub Packages with the following settings:

### Package Configuration

- **Registry**: `https://npm.pkg.github.com/`
- **Access**: `public` (packages can be installed by anyone)
- **Package Names**: `@noshiro-pf/package-a`, `@noshiro-pf/package-b`

## Prerequisites

### 1. GitHub Personal Access Token (PAT)

You need a GitHub Personal Access Token with the following permissions:

1. Go to **GitHub Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token (classic)**
3. Select scopes:
    - `read:packages` (to download packages)
    - `write:packages` (to publish packages)
    - `repo` (if repository is private)
4. Generate and copy the token
5. Add to repository secrets as `NPM_TOKEN`

### 2. Repository Secrets

Add the following secrets to your repository (**Settings** → **Secrets and variables** → **Actions**):

- `NPM_TOKEN`: Your GitHub Personal Access Token
- `CHANGESETS_BOT_PRIVATE_KEY`: GitHub App private key (already configured)

### 3. Repository Variables

Add the following variables (**Settings** → **Secrets and variables** → **Actions**):

- `CHANGESETS_BOT_APP_ID`: GitHub App ID (already configured)

## Publishing Process

### Automatic Publishing via Changesets

1. **Create a changeset**: `npx changeset`
2. **Select packages** to version
3. **Choose version bump** (patch, minor, major)
4. **Write summary** of changes
5. **Commit and push** the changeset
6. **Wait for release PR** to be created automatically
7. **Merge the release PR** to trigger publishing

### Manual Publishing

```bash
# Build packages
pnpm run build

# Publish to GitHub Packages
pnpm run release
```

## Installing Published Packages

### 1. Create .npmrc file

Users need to create a `.npmrc` file in their project root:

```
@noshiro-pf:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

### 2. Set Authentication

Users need to authenticate with GitHub Packages:

#### Option A: Using Personal Access Token

```bash
export NODE_AUTH_TOKEN=your_github_pat_here
```

#### Option B: Using npm login

```bash
npm login --scope=@noshiro-pf --registry=https://npm.pkg.github.com/
```

### 3. Install Package

```bash
pnpm install @noshiro-pf/package-a
pnpm install @noshiro-pf/package-b
```

## Package Usage

```javascript
import { someFunction } from '@noshiro-pf/package-a';
import { anotherFunction } from '@noshiro-pf/package-b';

someFunction();
anotherFunction();
```

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check if the PAT has correct permissions
2. **404 Not Found**: Verify package name and registry URL
3. **Authentication Required**: Ensure `.npmrc` is properly configured

### Debugging Commands

```bash
# Check npm configuration
npm config list

# Check registry configuration
npm config get registry
npm config get @noshiro-pf:registry

# Test authentication
npm whoami --registry=https://npm.pkg.github.com/
```

### Workflow Debugging

1. Check Actions logs for detailed error messages
2. Verify all secrets and variables are correctly set
3. Ensure GitHub App is properly installed and has correct permissions

## Security Best Practices

1. **Rotate PATs regularly** (every 6-12 months)
2. **Use minimal scope permissions** for PATs
3. **Monitor package downloads** for suspicious activity
4. **Keep dependencies updated** to avoid security vulnerabilities

## Package Visibility

- **Public packages**: Can be installed by anyone (current configuration)
- **Private packages**: Require authentication and appropriate permissions

Your packages are configured as `public`, meaning anyone can install them once they configure their `.npmrc` file correctly.
