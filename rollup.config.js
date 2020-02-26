/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';

import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

const input = 'src/labkey.ts';

const tscOptions = {
    tsconfigOverride: {
        compilerOptions: {
            declaration: true
        },
        exclude: [
            "**/*.spec.ts"
        ],
        files: [
            input
        ]
    }
};

export default [
    {
        input,
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
        input,
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