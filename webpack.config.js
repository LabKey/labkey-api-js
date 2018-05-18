/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';

module.exports = {

    devtool: 'source-map',

    entry: {
        'core': [
            './src/wrapper.ts'
        ],
        'dom': [
            './src/wrapper-dom.ts'
        ]
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: ['ts-loader'],
                exclude: /node_modules/
            }
        ]
    },

    output: {
        filename: 'dist/labkey-api-js-[name].min.js'
    },

    resolve: {
        extensions: [ '.ts' ]
    }
};