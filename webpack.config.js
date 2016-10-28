/*
 * Copyright (c) 2016 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';

var path = require("path");
var webpack = require('webpack');

var config = {

    devtool: 'source-map',

    entry: './src/wrapper.ts',

    module: {
        loaders: [
            [
                {
                    test: /\.ts$/,
                    loaders: ['babel', 'ts'],
                    exclude: /node_modules/
                }
            ]
        ]
    },

    output: {
        filename: 'dist/labkey-api-js.min.js'
    },

    resolve: {
        root: [ path.resolve('../src') ],
        extensions: [ '', '.ts' ]
    }
};

module.exports = config;