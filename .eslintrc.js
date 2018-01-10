const prettierOptions = require('./.prettier.js');

module.exports = {
  extends: ['airbnb-base', 'prettier'],
  plugins: ['import', 'prettier'],
  rules: {
    radix: 'off',
    'prettier/prettier': ['error', prettierOptions],
    // the prettier config override for this is broken
    curly: 'off',
    // turn this on when https://github.com/eslint/eslint/issues/4680 is done
    'one-var': 'off',
    // in practice, not allowing string concat is awkward
    'prefer-template': 'off',
    // allow for-of. Why wouldn't I?
    'no-restricted-syntax': 'off',
    // needed to write utility functions as a class' siblings
    'no-use-before-define': ['error', { functions: true, classes: false }],
    // else return makes intension more obvious
    'no-else-return': 'off',
    // huh?
    'no-plusplus': 'off',
    // good in theory, annoying in practice
    'no-param-reassign': 'off',
    // this rule is just dumb
    'class-methods-use-this': 'off',
    // Rollup seems to handle named exports better
    'import/prefer-default-export': 'off',
    // You're not my dad
    'no-nested-ternary': 'off',
    // this had the effect of forbidding mixing + and -
    'no-mixed-operators': 'off',
    // modern browsers only
    'no-prototype-builtins': 'off',
    // this is a dumb rule
    'no-else-return': 'off',
    // I find this occasionally useful
    'no-cond-assign': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['test/**/*.js', 'benchmarks/*.js', 'gulpfile.js'] }
    ]
  }
};
