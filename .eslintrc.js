module.exports = {
  extends: ['airbnb-base'],
  plugins: ['modulajs', 'import'],

  // Stop ESLint from looking for a configuration file in parent folders
  root: true,

  parser: '@babel/eslint-parser',

  env: {
    browser: true,
    node: true,
    mocha: true
  },

  rules: {
    /**
     * Best Practice
     */
    'class-methods-use-this': 'off',
    'no-else-return': 'off',
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: [
          'memo', // for reduce accumulators
          'model', // for ModulaJS model
          'target', // for decorators
          'e' // for e.returnvalue
        ]
      }
    ],
    'no-unused-expressions': 'off',

    /**
     * Style
     */
    'comma-dangle': ['error', 'never'],
    'function-paren-newline': 'off',
    'no-underscore-dangle': 'off',
    'object-curly-newline': 'off',

    /**
     * ES 6
     */
    'arrow-parens': [
      'error',
      'as-needed',
      {
        requireForBlockBody: false
      }
    ],
    'max-len': [
      'error',
      120,
      2,
      {
        ignoreUrls: true,
        ignoreComments: false,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true
      }
    ],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],

    /**
     * imports
     */
    'import/prefer-default-export': 'off'
  }
};
