const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    hot: true,
    port: 8082,
    historyApiFallback: true,
    static: './build/renderer',
  },
  plugins: [
    new ReactRefreshWebpackPlugin(),
  ],
}); 