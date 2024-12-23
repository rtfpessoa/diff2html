import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginJest from 'eslint-plugin-jest';
import json from '@eslint/json';
import pluginPromise from 'eslint-plugin-promise';

export default [
  { ...eslint.configs.recommended, files: ['src/**/*.{js,mjs,cjs,ts}'] },
  ...tseslint.configs.recommended,
  // ...tseslint.configs.recommendedTypeChecked,
  // ...tseslint.configs.strict,
  // ...tseslint.configs.stylistic,
  // ...tseslint.configs.strictTypeChecked,
  // ...tseslint.configs.stylisticTypeChecked,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  pluginPromise.configs['flat/recommended'],
  {
    plugins: {
      json,
    },
    files: ['**/*.json'],
    language: 'json/json',
    rules: {
      'json/no-duplicate-keys': 'error',
    },
  },
  {
    ...pluginJest.configs['flat/recommended'],
    ...pluginJest.configs['flat/style'],
    files: ['src/__tests__/**/*tests.ts'],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2025,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        window: 'readonly',
      },
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: './',
      },
    },
  },
  {
    ignores: ['src/diff2html-templates.*', 'coverage/', 'docs/', 'bundles-out/', 'bundles/', 'lib/', 'lib-esm/'],
  },
  {
    ...tseslint.configs.disableTypeChecked,
    files: ['**/*.{js,mjs,cjs}'],
  },
];
