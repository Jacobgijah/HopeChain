module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  env: {
    es2020: true,
  },
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-undef': 'off' // Disable this rule
  }
};
