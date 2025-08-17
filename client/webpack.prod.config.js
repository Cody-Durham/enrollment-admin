const { merge } = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const base = require("./webpack.config");

const config = {
    plugins: [
        // A webpack plugin to remove/clean the output folder before building
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            filename: "[name].[hash].css",
            chunkFilename: "[id].[hash].css",
            ignoreOrder: false // Enable to remove warnings about conflicting order
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: true,
                parallel: true,
                terserOptions: {
                    mangle: true,
                    output: {
                        comments: false
                    },
                    toplevel: true
                }
            }),
            new CssMinimizerPlugin({})
        ]
    }
};

module.exports = merge(base, config);
