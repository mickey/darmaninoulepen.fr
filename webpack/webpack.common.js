const Path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const sourcesData = require('../src/scripts/data.json');

module.exports = {
  entry: {
    app: Path.resolve(__dirname, '../src/scripts/index.js'),
  },
  output: {
    path: Path.join(__dirname, '../build'),
    filename: 'js/[name].js',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({ patterns: [{ from: Path.resolve(__dirname, '../public'), to: '' }] }),
    new HtmlWebpackPlugin({
      template: Path.resolve(__dirname, '../src/index.ejs'),
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      template: Path.resolve(__dirname, '../src/a_propos.ejs'),
      filename: 'a_propos.html',
    }),
    new HtmlWebpackPlugin({
      template: Path.resolve(__dirname, '../src/sources.ejs'),
      filename: 'sources.html',
      templateParameters: {
        'data': sourcesData
      },
    }),
  ],
  resolve: {
    modules: [Path.resolve(__dirname, '..', 'node_modules')],
    alias: {
      '~': Path.resolve(__dirname, '../src'),
      vue$: "vue/dist/vue.esm-bundler.js",
      animejs$: "animejs/lib/anime.es.js"
    },
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
          },
        },
      },
      {
        test: /\.ejs$/,
        use: 'ejs-compiled-loader'
      },
    ],
  },
};
