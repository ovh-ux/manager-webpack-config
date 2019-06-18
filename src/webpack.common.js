const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const RemcalcPlugin = require('less-plugin-remcalc');
const WebpackBar = require('webpackbar');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const _ = require('lodash');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const cacheLoader = {
  loader: 'cache-loader',
  options: {
    cacheDirectory: path.resolve(process.cwd(), 'node_modules/.cache-loader'),
  },
};

// The common webpack configuration

module.exports = (opts) => {
  const lessLoaderOptions = {
    sourceMap: true,
    plugins: [
      RemcalcPlugin, // required by ovh-ui-kit
    ],
    relativeUrls: false,
  };

  if ('lessPath' in opts) {
    _.set(lessLoaderOptions, 'paths', opts.lessPath);
  }

  return {
    plugins: [
      // copy application assets
      // note: we could use the html-loader plugin but it wouldn't work for dynamic src attributes!
      new CopyWebpackPlugin(
        _.get(opts, 'assets.files', []),
        _.get(opts, 'assets.options', {}),
      ),

      // see : https://github.com/jantimon/html-webpack-plugin
      new HtmlWebpackPlugin({
        template: opts.template, // path to application's main html template
      }),

      // display pretty loading bars
      new WebpackBar({
        name: 'OVH Manager',
        color: '#59d2ef',
      }),

      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].css',
      }),
    ],

    resolve: {
      modules: [
        './node_modules',
        path.resolve('./node_modules'),
      ],
    },

    resolveLoader: {

      // webpack module resolution paths
      modules: [
        './node_modules', // #1 check in module's relative node_module directory
        path.resolve('./node_modules'), // #2 check in application's node_module directory
      ],
    },

    module: {
      rules: [

        // load HTML files as string (raw-loader)
        {
          test: /\.html$/,
          loader: 'raw-loader',
        },

        // load images & fonts into file or convert to base64 if size < 10Kib
        {
          test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
          },
        },

        // load css files
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            cacheLoader,
            {
              loader: 'css-loader', // translates CSS into CommonJS
            },
            {
              loader: 'resolve-url-loader', // specify relative path for Less files
              options: {
                root: opts.root,
              },
            },
          ],
        },

        // load Less files
        {
          test: /\.less$/,
          use: [
            MiniCssExtractPlugin.loader,
            cacheLoader,
            {
              loader: 'css-loader', // translates CSS into CommonJS
            },
            {
              loader: 'resolve-url-loader', // specify relative path for Less files
              options: {
                root: opts.root,
              },
            },
            {
              loader: 'less-loader', // compiles Less to CSS
              options: lessLoaderOptions,
            },
          ],
        },

        // load Sass files
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            cacheLoader,
            'css-loader', // translates CSS into CommonJS
            'sass-loader', // compiles Sass to CSS
          ],
        },

        // load translations (convert from xml to json)
        {
          test: /Messages_\w+_\w+\.xml$/,
          use: [
            cacheLoader,
            {
              loader: path.resolve(__dirname, './loaders/translation-xml.js'),
            },
          ],
        },

        // load JS files
        {
          test: /\.js$/,
          exclude: /node_modules(?!\/ovh-module)/, // we don't want babel to process vendors files
          use: [
            cacheLoader,
            {
              loader: 'babel-loader', // babelify JS sources
              options: {
                presets: [
                  require.resolve('@babel/preset-env'), // babel preset configuration
                ],
                plugins: [
                  require.resolve('@babel/plugin-syntax-dynamic-import'), // dynamic es6 imports
                  require.resolve('babel-plugin-angularjs-annotate'), // ng annotate
                ],
              },
            },
          ],
        },

        // inject translation imports into JS source code,
        // given proper ui-router state 'translations' property
        {
          test: /\.js$/,
          exclude: /node_modules(?!\/ovh-module)/,
          enforce: 'pre',
          use: [
            cacheLoader,
            {
              loader: path.resolve(__dirname, './loaders/translation-ui-router.js'),
              options: {
                subdirectory: 'translations',
                filtering: false,
              },
            },
          ],
        },

        // inject translation with @ngTranslationsInject comment
        {
          test: /\.js$/,
          exclude: /node_modules(?!\/ovh-module)/,
          enforce: 'pre',
          use: [
            cacheLoader,
            {
              loader: path.resolve(__dirname, './loaders/translation-inject.js'),
              options: {
                filtering: false,
              },
            },
          ],
        },
      ], // \rules
    }, // \module

    optimization: {

      // bundle spliting configuration
      splitChunks: {

        // vendors bundle containing node_modules source code
        cacheGroups: {
          bower: {
            chunks: 'initial',
            test: /[\\/]node_modules[\\/]@bower_components[\\/]/,
            name: 'bower',
            enforce: true,
            priority: 1,
          },
          ovh: {
            chunks: 'initial',
            test: /[\\/]node_modules[\\/]@ovh-ux[\\/]/,
            name: 'ovh',
            enforce: true,
            priority: 1,
          },
          vendor: {
            chunks: 'initial',
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            enforce: true,
          },
        },
      },

    }, // \optimization
  };
};
