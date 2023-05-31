// const { pathsToModuleNameMapper } = require("ts-jest");
// const { compilerOptions } = require("./tsconfig");

 module.exports =  {
  clearMocks: true,
  coverageProvider: "v8",
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  // modulePaths: [compilerOptions.baseUrl],
  // moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
  //   prefix: "<rootDir>/",
  // }),
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  // globals: {
  //   "ts-jest": {
  //     tsconfig: "<rootDir>/tsconfig.json"}
  // }
};
