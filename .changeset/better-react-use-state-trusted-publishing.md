---
'better-react-use-state': patch
---

Publish the changes listed under 1.0.1 and 1.0.2 below, which never reached npm: npm already held 1.0.1 and 1.0.3 from hand publishes, and 1.0.2 had been published and withdrawn, so its number cannot be reused. Upgrading from npm's 1.0.3 brings both: the build with the native TypeScript compiler, and `resetState` resetting to the mount-time initial state with a stable identity. This is also the package's first publish through npm trusted publishing.
