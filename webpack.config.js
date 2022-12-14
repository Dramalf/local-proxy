// webpack.prod.js
const path = require("path");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const getStyleLoaders = (preProcessor) => {
  return [
    MiniCssExtractPlugin.loader,
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [
            "postcss-preset-env", // 能解决大多数样式兼容性问题
          ],
        },
      },
    },
    preProcessor,
  ].filter(Boolean);
};

module.exports = {
  entry: {
    popup:path.resolve(__dirname, "src/popup/index.jsx"),
    service_worker:path.resolve(__dirname, "src/service_worker/index.jsx"),
    content:path.resolve(__dirname, "src/content/index.js")
  },
  optimization: {
    minimize: true
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "js/[name].js",
    chunkFilename: 'js/[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            // 用来匹配 .css 结尾的文件
            test: /\.css$/,
            // use 数组里面 Loader 执行顺序是从右到左
            use: getStyleLoaders(),
          },
          {
            test: /\.s[ac]ss$/,
            use: getStyleLoaders("sass-loader"),
          },
          {
            test: /\.(png|jpe?g|gif|svg)$/,
            type: "asset",
            parser: {
              dataUrlCondition: {
                maxSize: 10 * 1024, // 小于10kb的图片会被base64处理
              },
            },
          },
          {
            test: /\.(jsx|js)$/,
            include: path.resolve(__dirname, "src"),
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              plugins: [
                // "@babel/plugin-transform-runtime" // presets中包含了
                ['babel-plugin-import', {
                    libraryName: '@alifd/next',
                    style: true
                  }]
              ],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // new ESLintWebpackPlugin({
    //   context: path.resolve(__dirname, "src"),
    //   exclude: "node_modules",
    //   cache: true,
    //   cacheLocation: path.resolve(
    //     __dirname,
    //     "node_modules/.cache/.eslintcache"
    //   ),
    // }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html"),
      excludeChunks: ['content']
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash:10].css",
      chunkFilename: "css/[name].[contenthash:10].chunk.css",
    }),
    // 将public下面的资源复制到dist目录去（除了index.html）
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public"),
          to: path.resolve(__dirname, "build"),
          toType: "dir",
          noErrorOnMissing: true, // 不生成错误
          globOptions: {
            // 忽略文件
            ignore: ["**/index.html"],
          },
          info: {
            // 跳过terser压缩js
            minimized: true,
          },
        },
      ],
    }),
  ],
  resolve: {
    extensions: [".jsx", ".js", ".json"],
  },
  mode: "production",
  devtool: "source-map" 
};
