module.exports = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  coverageDirectory: "./coverage",
  coverageReporters: ["lcov", "text", "html"],
  coverageThreshold: {
    global: {
      statements: 94,
      branches: 85,
      functions: 98,
      lines: 93
    }
  }
};
