export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs', 'cjs'],
  testMatch: ['**/__tests__/**/*.{js,mjs}', '**/?(*.)+(spec|test).{js,mjs}'],
  collectCoverageFrom: [
    'src/**/*.mjs',
    '!src/index.mjs',
    '!src/mocks/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};

