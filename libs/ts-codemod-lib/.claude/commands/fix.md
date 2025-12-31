Verify these command and fix errors:

- [ ] `pnpm i`
- [ ] `pnpm run tsc` - Type checking
- [ ] `pnpm run test` - Run all tests
- [ ] `pnpm run lint` - ESLint validation
- [ ] `pnpm run fmt` - Code formatting
- [ ] `pnpm run build` - Full build pipeline

## Code Style Guidelines

- **NEVER**: Use `as any`, `as never`, or `@ts-ignore` (use `@ts-expect-error` when absolutely necessary)
- **YOU MUST**: Use `.toStrictEqual()` instead of `.toEqual()` in Vitest tests
- **YOU MUST**: Use `test()` instead of `it()` in Vitest tests
- **YOU MUST**: Use named exports unless restricted by libraries or frameworks
- **IMPORTANT**: Use arrow functions in all cases
- **PREFER**: Type-safe operations over unsafe type assertions
- **PREFER**: Readonly parameter types for complex objects
- **PREFER**: Running single tests over the whole test suite for performance
- **PREFER**: ES modules (import/export) syntax over CommonJS (require)
- **PREFER**: Destructuring imports when possible (e.g., `import { foo } from 'bar'`)
- **PREFER**: Avoid using `// eslint-disable-next-line` or `eslint-disable` as possible.
- **PREFER**: Avoid any casting as possible.
- **PREFER**: Use `expectType<A, B>('=')` whenever possible. Avoid using `expectType<A, B>('<=')` or `expectType<A, B>('!=')` except when intended.
- **RESTRICTIONS**: Do not perform these actions without explicit user instructions:
    - Push to GitHub or remote repositories
    - Access `~/.ssh` or other sensitive directories
