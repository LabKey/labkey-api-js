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
        filename: 'dist/clientapi_core.min.js'
    },

    resolve: {
        root: [ path.resolve('../src') ],
        extensions: [ '', '.ts' ]
    }
};

module.exports = config;