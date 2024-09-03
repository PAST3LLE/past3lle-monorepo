const webpack = require("webpack")

module.exports = (webpackConfig) => (
    {
        ...webpackConfig,
        plugins: [
            ...webpackConfig.plugins,
            new webpack.ProvidePlugin({
                process: 'process/browser',
            }),
            new webpack.ProvidePlugin({
                Buffer: ["buffer", "Buffer"],
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
                'process.env.REACT_APP_WEB3MODAL_ID': JSON.stringify(process.env.REACT_APP_WEB3MODAL_ID || ''),
                'process.env.REACT_APP_WEB3_AUTH_ID': JSON.stringify(process.env.REACT_APP_WEB3_AUTH_ID || ''),
                'process.env.REACT_APP_ALCHEMY_API_KEY': JSON.stringify(process.env.REACT_APP_ALCHEMY_API_KEY || ''),
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.(js|mjs|jsx|ts|tsx)$/,
                    loader: require.resolve('babel-loader'),
                },
                {
                    test: /\.json$/,
                    loader: 'json-loader'
                },
                {
                    test: /\.png$/,
                    loader: 'file-loader'
                },
                {
                    test: /\.m?js/,
                    type: "javascript/auto",
                },
                {
                    test: /\.m?js/,
                    resolve: {
                        fullySpecified: false,
                    },
                }
            ]
        },
        resolve: {
            ...webpackConfig.resolve,
            fallback: {
                crypto: require.resolve("crypto-browserify"),
                stream: require.resolve("stream-browserify"),
                assert: require.resolve("assert"),
                http: require.resolve("stream-http"),
                https: require.resolve("https-browserify"),
                os: require.resolve("os-browserify"),
                url: require.resolve("url"),
                vm: require.resolve("vm-browserify"),
                zlib: false
            },
        },
    }
)