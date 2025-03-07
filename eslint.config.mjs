import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
  },
  {
    ignores: ['dist'],
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    rules: {
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'no-console': 'warn',
      'comma-dangle': ['error', 'always-multiline'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'no-multiple-empty-lines': ['warn', { 'max': 1 }],
      'require-await': 'warn',
      'eol-last': ['error', 'always'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
)
