/*
 * Copyright (c) 2016-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';
const path = require('path');

const umdPackageConfig = {

    entry: './src/index.ts',

    mode: 'production',

    target: 'web',

    devtool: 'source-map',
    
    module: {
        rules: [
            {
                test: /^(?!.*spec\.ts?$).*\.ts?$/,
                loader: 'ts-loader',
                options: {
                    compilerOptions: {
                        outDir: path.resolve(__dirname, 'dist'),
                        declaration: true,
                        removeComments: true,
                        target: 'ES6',
                    },
                    onlyCompileBundledFiles: true
                },
                exclude: /node_modules/
            }
        ]
    },

    optimization: {
        // don't minimize; module/app usages will be doing that if they want to
        minimize: false
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: '@labkey/api',
        libraryTarget: 'umd'
    },

    resolve: {
        extensions: [ '.ts' ]
    }
};

module.exports = [
    umdPackageConfig
];