# Chrome Web Store listing

Copy for the dashboard, kept here so that what was submitted is written down
and the next version can be edited rather than rewritten. Field limits are the
store's.

Upload `pack/github-view-defaults-extension-<version>.zip` from
`pnpm run pack` — not `dist/`, which carries the source maps. Once **verified
CRX upload** is turned on for the item, a zip is refused and
`pnpm run pack:crx` is what to upload instead: the same package, signed by
Chrome with the key registered on the account, which the script takes out of
`pass`. There is no such key yet; `pack-crx.mts` says how to make one.

## Store listing

**Name** (45 characters)

```text
GitHub View Defaults
```

**Summary** (132 characters)

```text
Opens GitHub PR diffs with whitespace hidden and viewed files collapsed, branches as the full list, and numbers PR and issue tabs.
```

**Description**

```text
Some GitHub pages open one click short of where you wanted them, every time.
Reviewing a pull request starts with hiding the whitespace-only changes and
collapsing the files already marked as viewed. Opening a repository's branches
lands on a summary, with the list of every branch one tab further on. GitHub
remembers none of it. This extension makes them the default.

It works with GitHub's own addresses, before the page loads — w=1 and
show-viewed-files=false, the same two the "Hide whitespace changes" and "Viewed
files" controls write, and the branches page's own "All" tab. What you get is
the ordinary GitHub page, opened the way you would have set it up by hand.

• Every route in. A link from a notification, a bookmark, a pasted URL, or the
  tab at the top of the page: all of them arrive set up. Links on the page are
  rewritten before you click them, so the usual case costs no extra page load
  at all.
• It gets out of the way. What the address already says is never overruled — so
  GitHub's own controls still work, a link somebody shared with the whitespace
  shown keeps showing it, and the branches page's own "Overview" tab still
  reaches the overview and stays there when you reload it.
• The address is the whole of it. What you get depends on the address you open
  and nothing else, so a link, a typed URL, a bookmark and a reload all agree.
• Numbered tabs. A pull request or an issue gets its number at the front of
  the tab title — "#1234 Fix the thing" — so a row of narrow tabs still says
  which is which.
• Two kinds of page, and no others. Pull request diffs and the branch overview
  have their address changed; pull requests and issues have their tab title
  numbered. Commit pages, comparisons and the rest of GitHub are untouched.
• Nothing is collected, stored or sent. No account, no analytics, no server, no
  storage permission. It runs on github.com and nowhere else.

Not affiliated with GitHub.
```

**Category**: Developer Tools.

**Language**: English.

## Single purpose

The store asks for one sentence, and means it:

```text
Opens GitHub pages at the view their own controls would have to be clicked to
reach — pull request diffs with whitespace-only changes hidden and viewed files
collapsed, and a repository's branches as the full list — so that view does not
have to be chosen by hand on every page, and titles pull request and issue tabs
with their number first so they can be told apart.
```

## Permission justifications

The extension declares **no** `permissions` and **no** `host_permissions`. The
one thing to justify is the content script.

**Content script on `https://github.com/*`**

```text
The extension's only job is to send two kinds of GitHub URL to the view they
would otherwise have to be clicked into. Deciding whether the current page is
such a URL, and rewriting the links on the page that point at one, has to
happen in the page, and so does putting a pull request's or an issue's number
at the front of its tab title. The script reads the page's address, the href of
its links and the page title, and nothing else — no other page content, no form
fields, no cookies, no storage. It is declared for github.com alone and runs
nowhere else.
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
<https://github.com/noshiro-pf/mono/blob/main/apps/github-view-defaults-extension/docs/privacy-policy.md>

## Screenshots

The store wants at least one, 1280×800 or 640×400. There is no command for
these here, deliberately: this extension has no interface of its own, so a
screenshot is a picture of GitHub, and the only honest one is a before-and-after
of a pull request whose diff is mostly whitespace — with a signed-in account,
since "viewed" files exist only for one — or of a repository with enough
branches for the overview to be hiding most of them. Which pull request or
repository that is, is a judgement about the listing rather than something a
script should pick.

Take them by hand on a diff you know: the Files changed tab as GitHub opens it,
and the same tab with the extension installed.

## What to expect from review

An extension with no permissions, no remote code and one content script on one
origin is the easy case. The two things that draw questions are the content
script's scope — answered above, and visibly narrow in the manifest — and the
privacy policy, which has to exist even though the answer to every question on
the form is "nothing".
