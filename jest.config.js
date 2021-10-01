module.exports = {
  testEnvironment: "node",
  roots: ["test"],
  coverageDirectory: "build/coverage",
  collectCoverageFrom: ["src/**/*.ts"],
  preset: "ts-jest",
};
