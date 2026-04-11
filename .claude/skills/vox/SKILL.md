```markdown
# vox Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `vox` TypeScript codebase. It covers file organization, import/export styles, commit message habits, and testing patterns. While no framework is detected, the repository follows clear conventions for code structure and test organization.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `audioEngine.ts`

### Import Style
- Use **relative imports** for referencing modules within the codebase.
  - Example:
    ```typescript
    import { AudioEngine } from './audioEngine';
    ```

### Export Style
- Use **named exports** rather than default exports.
  - Example:
    ```typescript
    // In audioEngine.ts
    export function createAudioEngine() { ... }

    // In another file
    import { createAudioEngine } from './audioEngine';
    ```

### Commit Patterns
- Commit messages are **freeform** (no strict type or scope).
- Some messages use prefixes, but not consistently.
- Average commit message length: **34 characters**.

## Workflows

### Adding a New Module
**Trigger:** When you need to add a new feature or utility.
**Command:** `/add-module`

1. Create a new file using camelCase (e.g., `featureName.ts`).
2. Write your code using named exports.
3. Use relative imports to include other modules.
4. Add corresponding tests in a `.test.ts` file.
5. Commit your changes with a concise, descriptive message.

### Writing and Running Tests
**Trigger:** When you add or update code that requires verification.
**Command:** `/run-tests`

1. Create a test file with the pattern `*.test.ts` (e.g., `audioEngine.test.ts`).
2. Write your tests using the project's preferred (but unspecified) testing framework.
3. Run the tests using the project's configured test runner (check project scripts or documentation).
4. Review test results and fix any failures.

## Testing Patterns

- Test files follow the `*.test.ts` naming convention.
- The specific testing framework is **unknown**; check project dependencies or documentation for details.
- Place tests alongside or near the modules they cover.
- Example test file:
  ```typescript
  // audioEngine.test.ts
  import { createAudioEngine } from './audioEngine';

  describe('createAudioEngine', () => {
    it('should initialize correctly', () => {
      const engine = createAudioEngine();
      expect(engine).toBeDefined();
    });
  });
  ```

## Commands
| Command      | Purpose                                   |
|--------------|-------------------------------------------|
| /add-module  | Scaffold and add a new module             |
| /run-tests   | Run all test files in the codebase        |
```
