module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import"
  ],
  "rules": {
    // in practice, not allowing string concat is awkward
    "prefer-template": "off",

    // allow for-of. Why wouldn't I?
    "no-restricted-syntax": "off",

    // this is broke as fuck for const, but works fine for let
    "indent": ["error", 2, { "VariableDeclarator": 2 }],

    // and because it's so broken, we force const declarations to be separate statements
    "one-var": ["error", { "let": "always", "const": "never" }],

    // needed to write utility functions as a class' siblings
    "no-use-before-define": ["error", { "functions": true, "classes": false }],

    // else return makes intension more obvious
    "no-else-return": "off",

    // huh?
    "no-plusplus": "off",

    // good in theory, annoying in practice
    "no-param-reassign": "off",

    // this rule is just dumb
    "class-methods-use-this": "off",

    // Rollup seems to handle named exports better
    "import/prefer-default-export": "off",

    // You're not my dad
    "no-nested-ternary": "off",

    // this had the effect of forbidding mixing + and -
    "no-mixed-operators": "off",

    // modern browsers only
    "no-prototype-builtins": "off"
  }
};
