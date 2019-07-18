module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    ecmaVersion: "2020",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
    "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
  ],
  plugins: ["import", "prettier", "@typescript-eslint"],
  rules: {
    "spaced-comment": ["error", "always", { exceptions: ["-"] }],
    "valid-jsdoc": "off",
    "prettier/prettier": "warn",
    "prefer-const": ["error", { destructuring: "all" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/prefer-includes": "off", // Only available in es2016
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/unbound-method": "off",
    "@typescript-eslint/no-use-before-define": "off",
  },
  env: {
    es6: true,
  },
};
