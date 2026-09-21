// cspell:ignore istextorbinary noto resvg

/**
 * Which licenses a dependency may carry, read by `check:root:licenses`
 * (`tools/scripts/cmd/check-licenses.mts`); `pnpm run licenses` prints the
 * same data against what is installed.
 *
 * ## What this repository does with its dependencies
 *
 * Every note below is written against these three uses, because a license
 * asks for something only when its text is conveyed to somebody else:
 *
 * - **`libs/*` and the strict-lib bundles are published with their
 *   dependencies declared, never bundled** (there is no bundler). A consumer
 *   installs the dependency from npm under its own license; nothing of it is
 *   in our tarball. So a published package redistributes nothing, and what
 *   matters there is whether a dependency's terms would bind the _consumer_ —
 *   which none of the licenses below does for an unmodified npm dependency.
 * - **`apps/*` are bundled and served**, which is redistribution of whatever
 *   ends up in the bundle. This is the one place a notice requirement is a
 *   thing to actually do.
 * - **Everything else is tooling** that runs on a developer's machine or a
 *   runner and is conveyed to nobody. A license there matters only if it
 *   restricts _use_ (none below does) — which is what a relicensing to BUSL,
 *   SSPL or a custom "source-available" text typically introduces, and why
 *   the check covers dev dependencies too.
 *
 * ## Editing this file
 *
 * - **`allowed` is for licenses that ask for nothing beyond keeping a
 *   notice**, so a new package under one needs no review. Anything that asks
 *   for more — sharing changes, attribution in a particular form, a text that
 *   is not a recognized open-source license — is an exception, however
 *   harmless the current use: the exception is where the use that makes it
 *   harmless is written down.
 * - **An exception names the license as well as the packages**, so a package
 *   that moves from one non-allowed license to another fails again rather than
 *   inheriting the old judgement. A trailing `*` covers a package's
 *   per-platform binaries, of which only the current platform's is installed.
 * - **An exception nothing installed matches fails the check.** Delete it
 *   with the dependency, as with a `cspell` word.
 * - **When the check fails on the `pnpm-update` pull request, the fix is a
 *   pull request to `main` editing this file**, by a person who has read the
 *   license. `chore/pnpm-update` is rebuilt from `main` on every run, so an
 *   edit made there is gone by the next one; and the `pnpm-update-ci` routine
 *   is told to leave this failure alone, because an exception added in order
 *   to turn the check green is the check switched off.
 *
 * ## What the check cannot see
 *
 * It reads the `license` field each installed `package.json` declares. A
 * LICENSE file replaced under an unchanged field is invisible, and so is a
 * platform binary for a platform the check never runs on.
 */
export const licensePolicy = {
  allowed: [
    {
      license: 'MIT',
      note: 'Keep the copyright and permission notice in copies. No patent grant. Nothing to do for a declared dependency; an app bundle keeps the notices its bundler preserves.',
    },
    {
      license: 'ISC',
      note: 'MIT in fewer words; the same single condition.',
    },
    {
      license: 'BSD-2-Clause',
      note: 'Keep the notice in source and in binary redistributions.',
    },
    {
      license: 'BSD-3-Clause',
      note: 'BSD-2-Clause, plus: do not use the authors’ names to endorse a derived product.',
    },
    {
      license: '0BSD',
      note: 'No conditions at all, not even the notice.',
    },
    {
      license: 'Apache-2.0',
      note: 'This repository’s own license. Redistribution keeps the license text and any NOTICE file, and marks modified files. Carries an explicit patent grant that ends for whoever sues over the work. Incompatible with GPL-2.0-only, which nothing here is under.',
    },
    {
      license: 'BlueOak-1.0.0',
      note: 'Permissive with a patent grant; redistribution gives the license text or a link to it. Written to be unambiguous rather than to add conditions.',
    },
    {
      license: 'CC0-1.0',
      note: 'Public-domain dedication with no conditions. It expressly grants no patent rights, which is why it suits data (it is only on data here) better than code.',
    },
    {
      license: 'Python-2.0',
      note: 'Permissive; keep the notice and summarise changes in a modified copy. On `argparse` 2.x, a port of the Python module.',
    },
    {
      license: 'PSF-2.0',
      note: 'The Python Software Foundation part of Python-2.0 on its own, with the same two conditions. On `argparse` 3.x.',
    },
  ],

  exceptions: [
    {
      license: 'MPL-2.0',
      packages: [
        'axe-core',
        'lightningcss',
        'lightningcss-*',
        'satori',
        '@resvg/resvg-js',
        '@resvg/resvg-js-*',
      ],
      reason:
        'File-level copyleft: a modified MPL file that is distributed stays MPL with its source available; the work around it may be under any license. All are used unmodified — `axe-core` is a dependency of `eslint-plugin-jsx-a11y`, the rest build `apps/synstate-docs` (CSS and Open Graph images) and do not reach its output. What to watch: a `pnpm patch` of one of these that ends up in something distributed has to be published.',
    },
    {
      license: 'LGPL-3.0-or-later',
      packages: ['@img/sharp-libvips-*'],
      reason:
        'Library copyleft: whoever distributes it must let the recipient replace the library and must offer its source. It is the prebuilt libvips that `sharp` loads dynamically, and `sharp` runs only while Astro builds images — the binary is never distributed. What to watch: shipping `sharp` inside an artifact (a container image, a desktop app, a serverless bundle) is distribution, and the LGPL terms then apply to that artifact.',
    },
    {
      license: 'OFL-1.1',
      packages: ['@fontsource/noto-sans-jp', '@fontsource/roboto'],
      reason:
        'The one exception that is redistributed: the apps serve these font files. The OFL allows bundling with anything, on condition that the copyright notice and license travel with the font — which it accepts as metadata inside the font file, and the files are served as published. What to watch: subsetting or converting the fonts ourselves makes a Modified Version, which may not keep the Reserved Font Name and must not drop that metadata; and the fonts may not be sold on their own.',
    },
    {
      license: 'CC-BY-4.0',
      packages: ['caniuse-lite'],
      reason:
        'Attribution license on browser-support data. `browserslist` reads it at build time to choose targets; the data itself is in no output, so there is nothing to attribute. What to watch: publishing a table derived from it (a compatibility page, say) needs the credit and a link to the license.',
    },
    {
      license: 'CC BY-SA 4.0',
      packages: ['@cspell/dict-en-common-misspellings'],
      reason:
        'Attribution plus share-alike on a word list cspell loads when it runs. Not redistributed. What to watch: copying entries from it into a dictionary of our own would make that dictionary an adaptation, to be released under the same license.',
    },
    {
      license: 'Artistic-2.0',
      packages: [
        'binaryextensions',
        'editions',
        'istextorbinary',
        'textextensions',
        'version-range',
      ],
      reason:
        'Unmodified use and redistribution are unrestricted; a modified version that is distributed must be renamed or have its changes offered back. One family, pulled in by `secretlint` for telling text files from binaries. Tooling only, unmodified.',
    },
    {
      license: 'WTFPL',
      packages: ['@azu/style-format'],
      reason:
        'Asks for nothing, but is not OSI-approved and has no warranty disclaimer, so it is on no standard allow-list and does not belong on this one as a class. A `textlint` formatter’s dependency; tooling only.',
    },
  ],
} as const satisfies LicensePolicy;

export type LicensePolicy = Readonly<{
  allowed: readonly Readonly<{ license: string; note: string }>[];
  exceptions: readonly Readonly<{
    license: string;
    packages: readonly string[];
    reason: string;
  }>[];
}>;
