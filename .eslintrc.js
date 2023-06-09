module.exports = {
  // extends: ["semistandard", "standard"],
  extends: [
    "react-app",
    "prettier",
    "plugin:react-native/all",
    "eslint:recommended",
  ],

  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["react", "react-native", "unused-imports"],
  env: {
    "react-native/react-native": true,
  },
  rules: {
    "react-native/no-unused-styles": 2,
    "react-native/split-platform-components": 2,
    "react-native/no-inline-styles": 2,
    "react-native/no-color-literals": 2,
    "react-native/no-raw-text": 2,
    "react-native/no-single-element-style-arrays": 2,
    "unused-imports/no-unused-imports": "error",
  },
};
