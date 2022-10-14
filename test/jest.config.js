/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@functions$': '<rootDir>/src/functions/.build/index.ts',
    '@functions/(.*)$': '<rootDir>/src/functions/.build/$1.ts'
  }
};