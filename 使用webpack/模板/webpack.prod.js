var path = require('path');
var VueLoaderPlugin = require('vue-loader/lib/plugin');
var Webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackMerge = require('webpack-merge');
var webpackBaseConfig = require('./webpack.dev.js');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

webpackBaseConfig.plugins = [];

module.exports = WebpackMerge(webpackBaseConfig, {
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].js'
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
          uglifyOptions: {
              compress: false
          }
      })
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'title',
      template: 'index.html'
    }),
    new VueLoaderPlugin()
  ]
});