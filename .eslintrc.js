module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    document: 'readonly',
    navigator: 'readonly',
    window: 'readonly',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:json/recommended',
    'plugin:promise/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:node/recommended',
    'plugin:sonarjs/recommended',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/babel',
  ],
  plugins: ['@typescript-eslint', 'json', 'promise', 'import', 'node', 'sonarjs', 'jest', 'optimize-regex'],
  rules: {
    // Enable
    'optimize-regex/optimize-regex': 'error',
    // Hack: For some reason we need pass again the extensions
    'node/no-missing-import': [
      'error',
      {
        tryExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      },
    ],
    // Disable
    // https://github.com/benmosher/eslint-plugin-import/issues/1446
    'import/named': 'off',
    // We don't need this since we are using transpilation
    'node/no-unsupported-features/es-syntax': 'off',
    'no-process-exit': 'off',
    // Too verbose
    'sonarjs/no-duplicate-string': 'off',
    // Too verbose
    'sonarjs/cognitive-complexity': 'off',
  },
};
