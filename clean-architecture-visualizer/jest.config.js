export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    testMatch: ["**/tests/**/*.test.ts"],
    transform: {
        "^.+\\.ts$": ["ts-jest", {
            tsconfig: "tsconfig.test.json",
            useESM: true,
        }],
    },
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1"
    },
    testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/frontend/" 
  ],
};