# General

- Do not perform the following actions without user instructions:
    - Git commit
    - Push to GitHub
- Do not access `~/.ssh`

## Code style

- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

## Workflow

- Be sure to run `type-check`, `test`, `lint:fix`, and `fmt` in that order when you’re done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance

## Development Philosophy

### Test-Driven Development (TDD)

- Follow Test-Driven Development (TDD) as a general principle
- Create tests first based on expected inputs and outputs
- Prepare only tests without writing implementation code
- Run the tests and confirm they fail
- Commit once you confirm the tests are correct
- Then proceed with implementation to make the tests pass
- During implementation, do not modify tests; continue fixing code
- Repeat until all tests pass
