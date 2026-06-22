export default [
    {
        ignores: ['node_modules/**', 'coverage/**', 'build/**', 'dist/**', 'tmp/**'],
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
        },
        rules: {},
    },
    {
        files: ['**/*.mjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
        },
        rules: {},
    },
];
