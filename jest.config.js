module.exports = {
  verbose: true,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { types: ['node', 'jest'] } }],
  },
  testEnvironment: 'node',
  coverageDirectory: './coverage',
  coverageReporters: ['lcov', 'text', 'html', 'json', 'cobertura', 'clover'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/ui/**',
    '!src/diff2html-templates.ts',
    '!src/__tests__/**',
    '!node_modules/**',
  ],
  coverageThreshold: {
    global: {
      statements: 93,
      branches: 86,
      functions: 98,
      lines: 93,
    },
  },
};
