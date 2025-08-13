/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)", "**/?(*.)+(spec|test).cjs"],
  testPathIgnorePatterns: ["/node_modules/", "/tests-e2e/"],
  transform: {},
};
