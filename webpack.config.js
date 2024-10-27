const path = require('path');

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
            "recharts": require.resolve("recharts")
        }
    },
    externals: {
        react: 'window.React',
        'react-dom': 'window.ReactDOM',
        redux: 'Redux',
        'react-redux': 'ReactRedux'
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
};