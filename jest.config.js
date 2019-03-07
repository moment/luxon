module.exports = {
  testEnvironment: "node",
  roots: ["test"],
  coverageDirectory: "build/coverage",
  collectCoverageFrom: ["src/**/*.js", "!src/zone.js", "!src/luxonFilled.js"]
};
