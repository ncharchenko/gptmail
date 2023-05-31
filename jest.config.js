/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  modulePathIgnorePatterns: ['<rootDir>/server/'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testTimeout: 30000,
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
};