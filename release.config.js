/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';

var path = require("path");
var webpack = require('webpack');

var config = {

    entry: {
        'index': [
            './src/labkey'
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
        filename: 'lib/[name].js'
    },

    resolve: {
        extensions: [ '.ts' ]
    }
};

module.exports = config;