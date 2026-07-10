/*
 * Copyright (c) 2016-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';

const path = require('path');

const apiGlobalConfig = {
    mode: 'production',

    devtool: 'source-map',

    entry: {
        core: ['./src/wrapper.ts'],
        dom: ['./src/wrapper-dom.ts'],
    },

    module: {
        rules: [
            {
                test: /^(?!.*spec\.ts?$).*\.ts?$/,
                loader: 'ts-loader',
                options: {
                    onlyCompileBundledFiles: true,
                    // Emit CommonJS ("nodenext", since package.json intentionally has no "type":"module") so LABKEY
                    // namespaces stay shared, writable exports that legacy runtime overrides can patch.
                    compilerOptions: {
                        module: 'nodenext',
                        moduleResolution: 'nodenext',
                    },
                },
            },
        ],
    },

    optimization: {
        // Disable scope hoisting so cross-module references resolve through the shared, patchable exports objects.
        concatenateModules: false,
    },

    output: {
        filename: 'labkey-api-js-[name].min.js',
    },

    resolve: {
        extensions: ['.ts'],
    },
};

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
                    },
                    onlyCompileBundledFiles: true,
                },
                exclude: /node_modules/,
            },
        ],
    },

    optimization: {
        // don't minimize; module/app usages will be doing that if they want to
        minimize: false,
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: '@labkey/api',
        libraryTarget: 'umd',
    },

    resolve: {
        extensions: ['.ts'],
    },
};

module.exports = [apiGlobalConfig, umdPackageConfig];
