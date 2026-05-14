export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: ['**/__tests__/**/*.mjs', '**/?(*.)+(spec|test).mjs'],
  collectCoverageFrom: [
    'src/**/*.mjs',
    '!src/index.mjs',
    '!src/mocks/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};

