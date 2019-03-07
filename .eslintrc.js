module.exports = {
  extends: ["standard", "plugin:prettier/recommended"],
  plugins: ["import", "prettier", "babel"],
  rules: {
    "linebreak-style": "off",
    "one-var": "off",
    "spaced-comment": ["error", "always", { exceptions: ["-"] }],
    "valid-jsdoc": "off"
  },
  env: {
    es6: true
  }
};
