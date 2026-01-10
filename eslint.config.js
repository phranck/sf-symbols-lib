import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import': importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      'no-useless-escape': 'off',
      'import/order': [
        'warn',
        {
          'groups': [
            'builtin',      // Node.js built-in modules
            'external',     // Third-party packages
            'internal',     // @shared, @backend, @frontend imports
            'parent',       // ../
            'sibling',      // ./
            'index'         // ./index
          ],
          'pathGroups': [
            {
              'pattern': '@shared/**',
              'group': 'internal',
              'position': 'before'
            },
            {
              'pattern': '@backend/**',
              'group': 'internal',
              'position': 'before'
            },
            {
              'pattern': '@frontend/**',
              'group': 'internal',
              'position': 'before'
            }
          ],
          'pathGroupsExcludedImportTypes': ['builtin'],
          'alphabetize': {
            'order': 'asc',
            'caseInsensitive': true
          },
          'newlines-between': 'always-and-inside-groups'
        }
      ]
    },
  }
);
