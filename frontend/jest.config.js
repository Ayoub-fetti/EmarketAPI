export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '\\.(jpg|png|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  transform: { '^.+\\.jsx?$': 'babel-jest' }
};
