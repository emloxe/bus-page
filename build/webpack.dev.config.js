const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const portfinder = require('portfinder');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.config');
const utils = require('./utils');
const config = require('./config');

const { HOST } = process.env;
const PORT = process.env.PORT && Number(process.env.PORT);

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  context: path.resolve(__dirname, '../'),
  devtool: 'inline-source-map', // 定位到错误的位置
  devServer: { // 配置webpack服务
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    publicPath: config.dev.assetsPublicPath,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    },
    overlay: config.dev.errorOverlay // 页面显示错误
    ? { warnings: false, errors: true }
    : false,
    open: config.dev.autoOpenBrowser,
    // proxy: [
    //   {
    //     // 后端静态资源、数据交互api、socket
    //     context: ["/business"],
    //     target: config.dev.proxyTarget,
    //   }
    // ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*'],
      },
    ]),
  ],
  module: {
    rules: [
      ...utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true }),
      {
        test: /\.html$/, // 处理图片，注意图片引用地址是否正确，否者会报 `ERROR in ./node_modules/html-webpack-plugin/lib/loader.js!` 错误
        use: {
          loader: 'html-loader',
        },
      },
    ],
  },
});

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port;
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err);
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port;
      // add port to devServer config
      devWebpackConfig.devServer.port = port;

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
          ? utils.createNotifierCallback()
          : undefined,
      }));

      resolve(devWebpackConfig);
    }
  });
});
