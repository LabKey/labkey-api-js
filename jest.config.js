module.exports = {
    globals: {
        LABKEY: {
            contextPath: '',
            defaultHeaders: {
                'X-LABKEY-CSRF': 'TEST_CSRF_TOKEN'
            }
        }
    },
    moduleFileExtensions: ['ts', 'js'],
    testEnvironment: 'jsdom',
    testResultsProcessor: 'jest-teamcity-reporter',
    testRegex: '(\\.(spec))\\.(ts)$',
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                // This increases test perf by a considerable margin
                isolatedModules: true,
            }
        ],
    },
};