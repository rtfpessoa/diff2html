module.exports = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  coverageDirectory: "./coverage",
  coverageReporters: ["lcov", "text", "html"],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    }
  }
};
