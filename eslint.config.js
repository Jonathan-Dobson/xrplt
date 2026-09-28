// ESLint 9 flat config for xrplt.
//
// Layered as: JS strict rules → TS strict rules → project ignores →
// per-glob overrides. Using `typescript-eslint` strict (not
// type-checked) so `npm run lint` doesn't need a parallel `tsc`
// pass — type-aware rules would slow lint by ~10×.

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 1. Base JS rules (ESLint-recommended baseline).
  eslint.configs.recommended,

  // 2. TypeScript strict preset (extends eslint-recommended with the
  // full TS-strict rule set + stylistic).
  ...tseslint.configs.strict,

  // 3. Project ignores — built output, deps, scratch worktrees.
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.worktrees/',
      'coverage/',
      // Generated JS — we author TS only.
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs',
    ],
  },

  // 4. Source files — full strictness.
  {
    files: ['src/**/*.ts', 'scripts/**/*.ts'],
    rules: {
      // The library is a public API; surface what shouldn't be reachable.
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // Off by default in js strict, but on here so the future fp
      // subpath stays consistent with the rest of the source tree.
      'no-warning-comments': [
        'error',
        { terms: ['todo', 'fixme', 'xxx'], location: 'start' },
      ],
    },
  },

  // 5. Tests — same strictness, but allow long intros and common
  // test patterns that don't read well as production code.
  {
    files: ['tests/**/*.ts'],
    rules: {
      // Tests routinely exceed 50 lines per file.
      'max-lines-per-function': 'off',
      // Tests legitimately reach into private state.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // 6. Type-only declaration files — typecheck ensures correctness;
  // lint passes through.
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);
