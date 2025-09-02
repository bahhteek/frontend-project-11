module.exports = {
  env: { browser: true, es2021: true },
  extends: ['airbnb-base', 'prettier'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: {
    'import/resolver': {
      node: { extensions: ['.js'] },
    },
  },
  rules: {
    'no-console': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.js',
          '**/*.spec.js',
          '**/vite.config.js',
          '**/webpack.config.js',
          '**/*.config.js',
        ],
        packageDir: ['.'],
      },
    ],
  },
}
