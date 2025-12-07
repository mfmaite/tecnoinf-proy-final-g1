module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js","@testing-library/jest-native/extend-expect"],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|expo-router|@expo/.*|react-clone-referenced-element|react-native-iphone-x-helper)",
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif)$": "<rootDir>/__mocks__/fileMock.js"
  }
  
};
