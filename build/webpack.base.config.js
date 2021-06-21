const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 处理html
const utils = require('./utils');
const config = require('./config');

function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

const createLintingRule = () => ({
  test: /\.(js)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  exclude: [resolve('node_modules')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay,
  },
});

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: { // 打包入口文件
    index: './src/script/index.js',
  },
  output: {
    path: config.build.assetsRoot, // 打包好的文件放在
    filename: '[name].js', // 打包好的文件名叫什么，指定name会将所有的js文件打包到该名称下，最好写为`[name].js`
    publicPath: process.env.NODE_ENV === 'production'
    ? config.build.assetsPublicPath
    : config.dev.assetsPublicPath
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: "vendor",
          test: /[\\/]node_modules[\\/]/,
          chunks: "all",
          priority: 10 // 优先级
        },
      }
    },
    runtimeChunk: {
      name: 'manifest',
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.html'), // 指定模板的位置
      inject: 'body', // 生成的js引入在main的'head'
      // 传入false则不引入生成的js,可以在html中写<script src="<%= HtmlWebpackPlugin.files.chunks.main.entry"></script> 这样也可以获取到main.js 的文件
      chunks: ['index'], // 需要哪个js就写哪个
      minify: { // 压缩
        removeComments: true, // 删除注释
        collapseInlineTagWhitespace: true, // 删除空格
      },
    }),
  ],
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []), // 是否在控制台输出eslint检查结构
      {
        test: /\.js$/, // 处理js文件
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'source-map-loader',
          },
        ],
        exclude: [resolve('node_modules')],
        include: [resolve('src')],
      },
      // {
      //   test: /\.css$/,    // 处理css文件
      //   use: [
      //     {loader: "style-loader"},  // style-loader将在html页面中添加style标签
      //     {loader: "css-loader", options: { importLoaders: 1 }},
      //     {loader: "postcss-loader"}  // importLoaders=1 在css文件中import引用的css 进行postcss-loader处理
      //   ],
      // },
      // {
      //   test: /\.less$/,    // 处理less文件
      //   use: [
      //     {loader: "style-loader"},
      //     {loader: "css-loader", options: { importLoaders: 1 }},
      //     {loader: "postcss-loader"},
      //     {loader: "less-loader", options: {
      //         strictMath: true,
      //         noIeCompat: true
      //       }}
      //   ],
      // },
      {
        test: /\.(png|jpg|gif|svg)$/i, // 图片处理
        loaders: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('images/[name]-[hash:7].[ext]'),
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name]-[hash:7].[ext]'),
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name]-[hash:7].[ext]'),
        },
      },
    ],
  },
};
