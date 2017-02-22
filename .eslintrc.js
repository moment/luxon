module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import"
  ],
  "rules": {
    "prefer-template": "off",
    "one-var": ["error", {"let": "always", "const": "never"}],
    "no-restricted-syntax": "off",
    "indent": ["error", 2, {"VariableDeclarator": 2}],
    "no-use-before-define": ["error", { "functions": true, "classes": false }],
    "no-else-return": "off",
    "no-plusplus": "off"
  }
};
