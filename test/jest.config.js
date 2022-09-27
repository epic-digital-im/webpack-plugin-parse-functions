/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@@functions$': '../src/functions/.build/index.ts',
    '@@functions/(.*)$': '../src/functions/.build/$1.ts'
  }
};