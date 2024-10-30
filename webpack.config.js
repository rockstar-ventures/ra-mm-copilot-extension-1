const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/index.tsx',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        modules: ['src', 'node_modules'],
        fallback: {
            "react": require.resolve("react"),
            "recharts": require.resolve("recharts"),
            "https": require.resolve("https-browserify"),
            "http": require.resolve("stream-http"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer/"),
            "util": require.resolve("util/"),
            "url": require.resolve("url/"),  // Added this
            "assert": require.resolve("assert/"),  // Added for dependencies
            "crypto": require.resolve("crypto-browserify"),  // Added for dependencies
            "zlib": require.resolve("browserify-zlib"),  // Added for dependencies
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
    externals: {
        react: 'window.React',
        'react-dom': 'window.ReactDOM',
        redux: 'Redux',
        'react-redux': 'ReactRedux'
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    }
};