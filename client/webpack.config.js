const path = require("path");

const config = {
    entry: "./src/index.js",
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
                options: { presets: ["@babel/env"] }
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.scss$/i,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.(png|jp(e*)g|svg|gif|eot|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 8000, // Convert images < 8kb to base64 strings
                            name: "images/[hash]-[name].[ext]"
                        }
                    }
                ]
            }
        ]
    },
    resolve: { extensions: [".*", ".js", ".jsx"] },
    output: {
        path: path.resolve(__dirname, "dist/"),
        publicPath: "/dist/",
        filename: "bundle.js"
    },
    devServer: {
        allowedHosts: [".dcsdk12.local", ".localhost"],
        port: 9000,
        historyApiFallback: true,
        hot: true,
        static: {
            directory: path.join(__dirname, "public")
        },
        host: "spa.dcsdk12.local",
        compress: true,
        server: {
            type: "https"
        }
    }
};

module.exports = config;
