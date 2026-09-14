# Chrome Web Store listing

Copy for the dashboard, kept here so that what was submitted is written down
and the next version can be edited rather than rewritten. Field limits are the
store's.

Upload `pack/github-diff-defaults-extension-<version>.zip` from
`pnpm run pack` — not `dist/`, which carries the source maps. Once **verified
CRX upload** is turned on for the item, a zip is refused and
`pnpm run pack:crx` is what to upload instead: the same package, signed by
Chrome with the key registered on the account, which the script takes out of
`pass`. There is no such key yet; `pack-crx.mts` says how to make one.

## Store listing

**Name** (45 characters)

```text
GitHub Diff Defaults
```

**Summary** (132 characters)

```text
Opens every GitHub pull request diff with whitespace changes hidden and the files you have already reviewed collapsed.
```

**Description**

```text
Reviewing a pull request on GitHub usually starts with two clicks nobody wants
to make: hide the whitespace-only changes, and collapse the files already
marked as viewed. GitHub remembers neither. This extension makes both the
default.

It works by putting GitHub's own settings on the address before the page loads
— w=1 and show-viewed-files=false, the same two the "Hide whitespace changes"
and "Viewed files" controls write — so what you get is the ordinary Files
changed page, opened the way you would have set it up by hand.

• Every route in. A link from a notification, a bookmark, a pasted URL, or the
  "Files changed" tab at the top of the pull request: all of them arrive with
  the settings on. Links on the page are rewritten before you click them, so
  the usual case costs no extra page load at all.
• It gets out of the way. A setting already on the address is never overwritten
  — so GitHub's own controls still work, and a link somebody shared with the
  whitespace shown keeps showing it.
• Pull request diffs only. Commit pages, comparisons and the rest of GitHub are
  untouched.
• Nothing is collected, stored or sent. No account, no analytics, no server, no
  storage permission. It runs on github.com and nowhere else.

Not affiliated with GitHub.
```

**Category**: Developer Tools.

**Language**: English.

## Single purpose

The store asks for one sentence, and means it:

```text
Applies two of GitHub's own pull request diff settings — hide whitespace-only
changes, and collapse files already marked as viewed — to every pull request
diff page, so they do not have to be set by hand on each one.
```

## Permission justifications

The extension declares **no** `permissions` and **no** `host_permissions`. The
one thing to justify is the content script.

**Content script on `https://github.com/*`**

```text
The extension's only job is to put two query parameters on GitHub pull request
diff URLs. Deciding whether the current page is such a URL, and rewriting the
links on the page that point at one, has to happen in the page. The script
reads the page's address and the href of its links, and nothing else — no page
content, no form fields, no cookies, no storage. It is declared for github.com
alone and runs nowhere else.
```

**Remote code**: No. The one script in the package is in the package; nothing
is fetched, evaluated or injected from anywhere else.

## Data usage

Every box on the data-usage form is **no**. The extension collects nothing:
no personally identifiable information, no health information, no financial
information, no authentication information, no personal communications, no
location, no web history, no user activity, no website content.

The three certifications are all true as written: the data is not sold, not
used for anything unrelated to the single purpose, and not used to determine
creditworthiness.

**Privacy policy URL**: the store asks for one whenever the item handles any
user data, and answering "none" is still an answer it wants a policy for.
Point it at
[`privacy-policy.md`](./privacy-policy.md) as rendered on GitHub:
<https://github.com/noshiro-pf/mono/blob/main/apps/github-diff-defaults-extension/docs/privacy-policy.md>

## Screenshots

The store wants at least one, 1280×800 or 640×400. There is no command for
these here, deliberately: this extension has no interface of its own, so a
screenshot is a picture of GitHub, and the only honest one is a before-and-after
of a pull request whose diff is mostly whitespace — with a signed-in account,
since "viewed" files exist only for one. Which pull request that is, is a
judgement about the listing rather than something a script should pick.

Take them by hand on a diff you know: the Files changed tab as GitHub opens it,
and the same tab with the extension installed.

## What to expect from review

An extension with no permissions, no remote code and one content script on one
origin is the easy case. The two things that draw questions are the content
script's scope — answered above, and visibly narrow in the manifest — and the
privacy policy, which has to exist even though the answer to every question on
the form is "nothing".
