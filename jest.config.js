module.exports = {
  testEnvironment: "node",
  roots: ["test", "src"],
  coverageDirectory: "build/coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/zone.ts",
    "!src/luxonFilled.ts",
    "!src/luxon.d.ts",
    "!src/types/intl.d.ts"
  ],
  preset: "ts-jest",
  moduleFileExtensions: ["ts", "js"]
};
