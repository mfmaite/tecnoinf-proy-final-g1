module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './test/babel.config.js' }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/fileMock.ts",
    "\\.(svg|png|jpg|jpeg|gif|webp|ico)$": "<rootDir>/__mocks__/fileMock.ts",
    "^next/image$": "<rootDir>/__mocks__/next/image.js"
  },
  setupFilesAfterEnv: ['<rootDir>/app/jest.setup.ts'],
};