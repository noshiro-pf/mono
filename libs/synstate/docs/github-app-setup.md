# GitHub App Setup for Changesets

This document describes how to create and configure a GitHub App for the Changesets workflow to trigger other GitHub Actions workflows when creating pull requests.

## Why is this needed?

By default, when GitHub Actions creates a pull request using the default `GITHUB_TOKEN`, it won't trigger other workflows. This is a security feature to prevent infinite loops. To work around this limitation, we use a GitHub App token instead.

## Step 1: Create a GitHub App

1. Go to your GitHub account settings (for personal repos) or organization settings (for org repos)
2. Navigate to **Developer settings** → **GitHub Apps**
3. Click **New GitHub App**
4. Fill in the following details:

### Basic Information

- **GitHub App name**: `[Your-Repo-Name] Changesets Bot` (e.g., `typescript-monorepo-template Changesets Bot`)
- **Homepage URL**: Your repository URL
- **Description**: "Bot for creating changesets release PRs that trigger workflows"

### Webhook

- **Active**: Uncheck this (we don't need webhooks)

### Permissions

Repository permissions:

- **Contents**: Read and write (to create branches and commits)
- **Pull requests**: Read and write (to create and update PRs)
- **Actions**: Read (to trigger workflows)
- **Metadata**: Read (always required)

**Important Note about GitHub Packages**: GitHub Apps cannot have package permissions. If you need to publish packages to GitHub Packages, you must use a Personal Access Token (PAT) with `write:packages` permission instead. See the [GitHub Packages Setup guide](./github-packages-setup.md) for details on configuring package publishing.

### Where can this GitHub App be installed?

- Choose **Only on this account**

5. Click **Create GitHub App**

## Step 2: Generate a Private Key

1. After creating the app, you'll be redirected to the app's settings page
2. Scroll down to **Private keys**
3. Click **Generate a private key**
4. Save the downloaded `.pem` file securely

## Step 3: Install the App

1. In your GitHub App settings, click **Install App**
2. Choose your account/organization
3. Select **Only select repositories** and choose your repository
4. Click **Install**

## Step 4: Configure Repository Secrets and Variables

1. Go to your repository's **Settings** → **Secrets and variables** → **Actions**

2. Add the following **Repository secrets**:
    - Name: `CHANGESETS_BOT_PRIVATE_KEY`
    - Value: The entire contents of the `.pem` file you downloaded (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

3. Add the following **Repository variables**:
    - Name: `CHANGESETS_BOT_APP_ID`
    - Value: Your GitHub App's ID (found on the app's settings page)

## Step 5: Verify the Setup

The `release.yml` workflow is already configured to use these secrets. When the workflow runs:

1. It will generate a GitHub App token using the app ID and private key
2. Use this token instead of `GITHUB_TOKEN` when creating release PRs
3. The PR created by changesets will now trigger other workflows (type-check, style-check, etc.)

## Troubleshooting

If workflows still don't trigger:

1. Verify the GitHub App has the correct permissions
2. Ensure the app is installed on the repository
3. Check that the secrets and variables are correctly named
4. Look at the Actions logs for any authentication errors

## GitHub Packages Publishing

This GitHub App setup is specifically for triggering workflows when Changesets creates PRs. However, **GitHub Apps cannot publish packages to GitHub Packages**.

For package publishing, you need:

1. A Personal Access Token (PAT) with `write:packages` permission
2. Store it as `NPM_TOKEN` in repository secrets
3. The release workflow will use this token for publishing

See the [GitHub Packages Setup guide](./github-packages-setup.md) for complete package publishing configuration.

## Security Notes

- Keep the private key secure and never commit it to the repository
- Regularly rotate the private key (regenerate and update the secret)
- Review the app's permissions periodically to ensure they're still appropriate
