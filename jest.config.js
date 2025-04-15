// Run all tests with timezone set to UTC
// https://stackoverflow.com/a/56482581
process.env.TZ = 'UTC';

// These are ES modules that we utilize that need to be transformed
// by babel when being imported during a jest test.
const esModules = ['@tinyhttp/content-disposition'].join('|');

module.exports = {
    globals: {
        LABKEY: {
            contextPath: '',
            defaultHeaders: {
                'X-LABKEY-CSRF': 'TEST_CSRF_TOKEN',
            },
        },
    },
    moduleFileExtensions: ['ts', 'js'],
    testEnvironment: 'jsdom',
    testResultsProcessor: 'jest-teamcity-reporter',
    testRegex: '(\\.(spec))\\.(ts)$',
    transform: {
        '\\.js$': [
            'babel-jest',
            {
                configFile: './jest.babel.config.js',
            },
        ],
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.test.json',
            },
        ],
    },
    transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
};
