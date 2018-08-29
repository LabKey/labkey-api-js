/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
'use strict';

const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {

    mode: 'production',

    entry: {
        main: './theme/webpack.js'
    },

    module: {
        rules: [{
            test: /\.sass$/,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: {
                        url: false
                    }
                },
                {
                    loader: 'sass-loader',
                    options: {
                        indentedSyntax: true
                    }
                }
            ]
        }]
    },

    output: {
        path: path.resolve(__dirname, '../docs/assets/css')
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css'
        })
    ]
};