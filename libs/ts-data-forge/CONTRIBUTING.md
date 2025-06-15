# Contributing to ts-data-forge

Thank you for your interest in contributing to `ts-data-forge`! We welcome contributions from everyone, whether you're fixing a bug, adding a feature, improving documentation, or suggesting improvements.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style and Guidelines](#code-style-and-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](https://github.com/noshiro-pf/ts-data-forge/blob/main/CODE_OF_CONDUCT.md). Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- **Node.js**: Version 20.11.0 or higher
- **npm**: Latest version
- **TypeScript**: Version 4.8 or higher

### Setting Up the Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

    ```bash
    git clone https://github.com/your-username/ts-data-forge.git
    cd ts-data-forge
    ```

3. **Install dependencies**:

    ```bash
    npm install
    ```

4. **Verify the setup** by running tests:

    ```bash
    npm test
    ```

## Development Workflow

### Essential Commands

- **Run tests**: `npm test`
- **Run tests in watch mode**: `npm run testw`
- **Type checking**: `npm run tsc`
- **Linting**: `npm run lint`
- **Formatting**: `npm run fmt`
- **Build the project**: `npm run build`
- **Full validation** (lint + test + build): `npm run check-all`

### Making Changes

1. **Create a feature branch** from `main`:

    ```bash
    git checkout main
    git pull origin main
    git checkout -b feature/your-feature-name
    ```

2. **Make your changes** following our [coding guidelines](#code-style-and-guidelines)

3. **Add tests** for your changes (see [Testing](#testing))

4. **Run the validation suite**:

    ```bash
    npm run check-all
    ```

5. **Commit your changes** with a descriptive message:

    ```bash
    git add .
    git commit -m "feat: add new utility function for array manipulation"
    ```

## Code Style and Guidelines

### TypeScript Guidelines

- **Use strict TypeScript**: All code must pass TypeScript's strict mode
- **Explicit types**: Prefer explicit return types for public functions
- **Branded types**: Use branded types for enhanced type safety where appropriate
- **No `any` types**: Avoid using `any`; use `unknown` instead
- **Readonly by default**: Prefer `readonly` arrays and objects where possible

### Code Patterns

- **Immutability**: All functions should return new objects rather than mutating inputs
- **Functional programming**: Prefer functional programming patterns
- **Pure functions**: Functions should be pure when possible (no side effects)
- **Type-first design**: Design APIs with TypeScript's type system in mind

### File Organization

- **Co-located tests**: Test files should be placed next to source files with `.test.mts` extension
- **Module structure**: Follow the existing module structure in `src/`
- **Index files**: Export public APIs through generated index files

### Naming Conventions

- **Functions**: Use camelCase (`mapArray`, `isNonEmpty`)
- **Types**: Use PascalCase (`Optional`, `Result`)
- **Constants**: Use UPPER_SNAKE_CASE for module-level constants
- **Files**: Use kebab-case for file names (`array-utils.mts`)

## Testing

### Testing Strategy

`ts-data-forge` uses a dual testing approach:

1. **Compile-time type testing** using `expectType`
2. **Runtime behavioral testing** using Vitest

### Writing Tests

When adding new functionality, include both types of tests:

```typescript
import { expectType } from '../expect-type.mjs';
import { yourNewFunction } from './your-module.mjs';

describe('yourNewFunction', () => {
    test('should work correctly', () => {
        const input = [1, 2, 3];
        const result = yourNewFunction(input);

        // Type-level assertion
        expectType<typeof result, SomeExpectedType>('=');

        // Runtime assertion
        expect(result).toStrictEqual(expectedValue);
    });
});
```

### Test Guidelines

- **Comprehensive coverage**: Test edge cases, error conditions, and type safety
- **Clear test names**: Use descriptive test names that explain the expected behavior
- **Isolated tests**: Each test should be independent and not rely on others
- **Performance considerations**: Consider performance implications for utility functions

## Submitting Changes

### Before Submitting

1. **Run the full validation suite**:

    ```bash
    npm run check-all
    ```

2. **Update documentation** if your changes affect the public API

3. **Add JSDoc comments** for new public functions

4. **Update CHANGELOG.md** if appropriate

### Commit Message Format

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```txt
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```txt
feat(array): add new isArrayAtLeastLength utility function
fix(optional): handle edge case in Optional.map
docs(readme): improve usage examples for IMap
test(number): add comprehensive tests for Num.clamp
```

## Issue Guidelines

### Reporting Bugs

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected vs actual behavior**
4. **TypeScript and Node.js versions**
5. **Code examples** that demonstrate the issue

### Feature Requests

For feature requests, please:

1. **Explain the use case** and motivation
2. **Provide examples** of how the feature would be used
3. **Consider type safety** implications
4. **Check existing issues** to avoid duplicates

## Pull Request Guidelines

### Pull Request Process

1. **Create a clear title** that describes the change
2. **Fill out the PR template** completely
3. **Reference related issues** using keywords like "Fixes #123"
4. **Request review** from maintainers
5. **Respond to feedback** promptly and constructively

### Review Criteria

Pull requests will be evaluated on:

- **Code quality** and adherence to guidelines
- **Test coverage** and quality
- **Documentation** completeness
- **Type safety** and TypeScript best practices
- **Performance** impact
- **Backward compatibility**

### Review Process

1. **Automated checks** must pass (CI/CD pipeline)
2. **Code review** by at least one maintainer
3. **Testing** on multiple environments if applicable
4. **Final approval** and merge by maintainers

## Getting Help

If you need help or have questions:

- **Check existing issues** and discussions
- **Create a new issue** with the "question" label
- **Join our community discussions** (if applicable)

## Recognition

Contributors will be recognized in:

- **README.md** acknowledgments
- **Release notes** for significant contributions
- **GitHub contributors** page

Thank you for contributing to `ts-data-forge`! Your efforts help make TypeScript development safer and more enjoyable for everyone.
