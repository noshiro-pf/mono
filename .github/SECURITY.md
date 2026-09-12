# Security policy

## Reporting a vulnerability

**Do not open a public issue.**

Use GitHub's private vulnerability reporting, which is enabled on this
repository: go to the [Security tab](https://github.com/noshiro-pf/mono/security)
and choose **Report a vulnerability**. The report stays private between you and
the maintainer until a fix is published.

That applies to anything that would let someone reach further than they should
— the release workflow, the GitHub App tokens the CI uses, the published
packages under `libs/`. An issue describing one of those is a set of
instructions, and this repository is public.

Ordinary bugs, including ones in a published package that have no security
consequence, belong in the normal issue tracker.

## Supported versions

The packages under `libs/` are published from `main`, and a fix ships in the
next release rather than as a backport. There are no maintained release
branches.
