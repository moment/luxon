module.exports = {
  extends: ["standard", "plugin:prettier/recommended"],
  plugins: ["import", "prettier", "babel"],
  rules: {
    "linebreak-style": "off",
    "one-var": "off",
    "spaced-comment": ["error", "always", { exceptions: ["-"] }],
    "valid-jsdoc": "off",
    "prefer-const": ["error", { destructuring: "all" }]
  },
  parserOptions: {
    ecmaVersion: "2020"
  },
  env: {
    es6: true
  },
  overrides: [
    {
      files: ["src/**/*.js"],
      plugins: ["es5"],
      extends: ["plugin:es5/no-es2015", "plugin:es5/no-es2016"],
      rules: {
        "es5/no-arrow-functions": "off",
        "es5/no-block-scoping": "off",
        "es5/no-block-scoping": "off",
        "es5/no-classes": "off",
        "es5/no-computed-properties": "off",
        "es5/no-default-parameters": "off",
        "es5/no-destructuring": "off",
        "es5/no-for-of": "off",
        "es5/no-modules": "off",
        "es5/no-object-super": "off",
        "es5/no-rest-parameters": "off",
        "es5/no-shorthand-properties": "off",
        "es5/no-spread": "off",
        "es5/no-template-literals": "off"
      }
    }
  ]
};
