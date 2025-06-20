module.exports = {
  testEnvironment: "node",
  roots: ["test"],
  coverageDirectory: "build/coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/zone.js"],
  setupFilesAfterEnv: ["./test/setup.js"],
  transform: {
    "^.+\\.js$": "babel-jest",
  },
};
