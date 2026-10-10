---
'eslint-config-typed': patch
---

Allow `firebase-admin/*` imports in `import-x/no-internal-modules`, as
`firebase-functions/**` already is. `firebase-admin` exposes its services only
through those entry points (`firebase-admin/app`, `firebase-admin/firestore`).
