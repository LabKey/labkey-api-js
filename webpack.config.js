/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';

var path = require("path");
var webpack = require('webpack');

var config = {

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
                loaders: ['babel-loader', 'ts-loader'],
                exclude: /node_modules/
            }
        ]
    },

    output: {
        filename: 'dist/labkey-api-js-[name].min.js'
    },

    resolve: {
        extensions: [ '.ts' ]
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true
        })
    ]
};

module.exports = config;