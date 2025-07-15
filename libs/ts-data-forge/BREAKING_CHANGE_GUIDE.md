# 🚨 BREAKING CHANGE Guide

This guide helps prevent common mistakes when creating breaking changes that should trigger major version releases.

## ✅ Correct Format

The **exact** format required by semantic-release:

```
BREAKING CHANGE: description of the breaking change
```

## ❌ Common Mistakes

These will **NOT** trigger a major version release:

| ❌ Wrong            | ✅ Correct          |
| ------------------- | ------------------- |
| `BREAKING CHANGE:`  | `BREAKING CHANGE: ` |
| `BREAKING CHANGES:` | `BREAKING CHANGE: ` |
| `BREAKING-CHANGE:`  | `BREAKING CHANGE: ` |
| `BREAKING_CHANGE:`  | `BREAKING CHANGE: ` |
| `BREAKINGCHANGE:`   | `BREAKING CHANGE: ` |
| `BREAKING CHANGE `  | `BREAKING CHANGE: ` |
| `BREAKING CHANGE;`  | `BREAKING CHANGE: ` |
| `BREAKING CHANGE.`  | `BREAKING CHANGE: ` |
| `breaking change:`  | `BREAKING CHANGE: ` |
| `Breaking Change:`  | `BREAKING CHANGE: ` |
| `BREAKING CHANGE`   | `BREAKING CHANGE: ` |

## 🛠️ Alternative Methods

### Method 1: Use Footer (Recommended)

```
feat: add new feature

This is the commit body explaining the feature.

BREAKING CHANGE: The old API method `oldMethod()` has been removed.
Use `newMethod()` instead.
```

### Method 2: Use Scoped Breaking (Easier)

```
feat(breaking): change API signature

This automatically triggers a major version without needing the exact format.
```

### Method 3: Use Body

```
feat: add new feature

BREAKING CHANGE: API has changed significantly.
```

## 📝 Templates

### Breaking Change Template

```
<type>: <description>

<body describing the change>

BREAKING CHANGE: <detailed description of what breaks and how to migrate>
```
