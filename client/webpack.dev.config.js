const { merge } = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const base = require("./webpack.config");

const config = {
    plugins: [
        // A webpack plugin to remove/clean the output folder before building
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ],
    devtool: "source-map",
    devServer: {
        allowedHosts: [".dcsdk12.local", ".localhost"],
        historyApiFallback: true,
        port: 9000,
        host: "spa.dcsdk12.local",
        https: true
    }
};

module.exports = merge(base, config);
