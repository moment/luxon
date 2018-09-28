const prettierOptions = require("./.prettier.js");

module.exports = {
  extends: ["standard", "prettier", "prettier/standard"],
  plugins: ["import", "prettier", "babel"],
  rules: {
    "prettier/prettier": ["error", prettierOptions],
    "linebreak-style": "off",
    "one-var": "off",
    "spaced-comment": ["error", "always", { "exceptions": ["-"] }],
    "valid-jsdoc": "off"
  },
  env: {
    "es6": true
  }
};
