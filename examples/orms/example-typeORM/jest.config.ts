module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: [
        '**/tests/**/*.test.ts',
        '**/?(*.)+(spec|test).[tj]s'
    ]
};