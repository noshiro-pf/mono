---
'synstate-router': minor
'synstate-router-react': minor
---

Devtools for synstate-router. synstate-router-react adds `RouterDevtools`, a development panel showing the location, the match, the route tree with the matched branch marked, and the last redirects; load it behind `import.meta.env.DEV` with `React.lazy`, so that a production build drops it. synstate-router adds what it reads: `describeRoutes(routes)`, every node with its pattern, params, search keys and whether it is a page, and `router.redirects`, the last redirects followed (up to `maxRedirectRecords`).
