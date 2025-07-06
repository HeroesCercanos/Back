module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'no-unused-vars': 'warn', // Solo advertencia, no error
    '@typescript-eslint/no-unused-vars': 'warn', // Solo advertencia para TypeScript
    'no-undef': 'off', // Desactiva la regla de variables no definidas
    '@typescript-eslint/no-explicit-any': 'off', // Permite 'any'
    'prettier/prettier': 'warn', // Muestra advertencias si el código no sigue el estilo de Prettier
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/'], // Ignora ciertas carpetas
};
