'use strict';

import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

const tscOptions = {
    tsconfigOverride: {
        compilerOptions: {
            declaration: true
        },
        exclude: [
            "**/*.spec.ts"
        ]
    }
};

export default [
    {
        input: 'src/labkey.ts',
        output: {
            file: 'dist/labkey-api-js-core.es.js',
            format: 'es',
            name: 'labkey-api-js-core'
        },
        plugins: [
            resolve(),
            typescript(tscOptions)
        ]
    },
    {
        input: 'src/labkey.ts',
        output: {
            file: 'dist/labkey-api-js-core.cjs.js',
            format: 'cjs',
            name: 'labkey-api-js-core'
        },
        plugins: [
            resolve(),
            typescript(tscOptions)
        ]
    }
]