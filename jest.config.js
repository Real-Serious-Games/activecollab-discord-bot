module.exports = {
    globals: {
        'ts-jest': {
            tsConfigFile: 'tsconfig.json'
        }
    },
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    transform: {
        '^.+\\.(ts|tsx)$': './node_modules/ts-jest/preprocessor.js'
    },
    testMatch: [
        '**/test/**/*.test.(ts|js)'
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        'testData.ts',
        'test/builders/'
    ],
    testEnvironment: 'node',
    mapCoverage: true,
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    }
};
