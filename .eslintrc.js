module.exports = {
  parser: "babel-eslint",
  extends: ["standard", "plugin:prettier/recommended"],
  plugins: ["import", "prettier", "babel"],
  rules: {
    "linebreak-style": "off",
    "one-var": "off",
    "spaced-comment": ["error", "always", { exceptions: ["-"] }],
    "valid-jsdoc": "off",
    "prettier/prettier": "warn"
  },
  env: {
    es6: true
  }
};
