const config = {
  testEnvironment: 'jsdom',
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  testPathIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules', 'src'],
  globals: {
    'import.meta': {
      env: {
        VITE_BACKEND_URL: 'http://localhost:3000/api',
        VITE_BACKEND_BASE_URL: 'http://localhost:3000'
      }
    }
  }
};

module.exports = config;
