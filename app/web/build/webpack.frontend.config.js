require('dotenv').config();
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');

const config = require('./config.js');

const PROD = process.env.NODE_ENV === 'production';

const cssLoader = (enableModules = true) => {
  return {
    loader: 'css-loader',
    options: {
      modules: enableModules,
      sourceMap: !PROD,
      importLoaders: 2,
      modules: {
        localIdentName: PROD ? '[local]__[hash:base64:5]' : '[local]',
      },
    },
  };
};

const postCssLoader = {
  loader: 'postcss-loader',
  options: {
    sourceMap: !PROD,
    postcssOptions: {
      public: [
        'postcss-preset-env',
        {
          // Options
          browsers: 'last 2 versions',
        },
      ],
    },
  },
};

const sassLoader = {
  loader: 'sass-loader',
  options: {
    sourceMap: !PROD,
  },
};

const localStyleLoaders = [cssLoader(), postCssLoader, sassLoader];

// We want to disable css module.
const globalStyleLoaders = [cssLoader(false), postCssLoader, sassLoader];

const devPlugins = [new webpack.HotModuleReplacementPlugin()]; // <- To generate hot update chunk
const prodPlugins = [];

const devEntries = [
  `webpack-dev-server/client?path=https://my-domain.com:443`, // <-- Enables web socket connection (needs url & port)
  'webpack/hot/dev-server', // <- To perform HMR in the browser
];

const clientAppEntryFilePath = path.resolve(config.webRoot, 'src/client.jsx');

module.exports = {
  entry: {
    frontEndMain: [
      'babel-polyfill',
      ...(PROD ? [] : devEntries),
      clientAppEntryFilePath,
    ],
  },
  output: {
    path: config.assetPath,
    filename: '[name]-[hash].js', // Hash is used to force cache invalidation.
    publicPath: PROD
      ? '/dist'
      : `https://my-domain.com:443/dist/`,
  },
  module: {
    rules: [
      //JavaScript & JSX
      {
        test: /\.(jsx|js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },

      // For local styles.
      {
        test: /\.(scss|css)$/,
        use: PROD
          ? [MiniCssExtractPlugin.loader, ...localStyleLoaders]
          : ['style-loader', ...localStyleLoaders],
        include: path.resolve(config.webRoot, 'src'),
        exclude: path.resolve(config.webRoot, 'src', 'theme'),
      },
      // Global styles
      // Just like the normal style loader stack, but without css modules so we don't modify
      // classnames for our style libraries like bootstrap, slick, etc
      {
        test: /\.(scss|css)$/,
        use: PROD
          ? [MiniCssExtractPlugin.loader, ...globalStyleLoaders]
          : ['style-loader', ...globalStyleLoaders],
        include: [path.resolve(config.webRoot, 'src', 'theme'), /node_modules/],
      },

      // Images: Copy image files to build folder
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        loader: 'url-loader',
        options: {
          limit: 10240,
        },
      },
      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/font-woff',
        },
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/octet-stream',
        },
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'mimetype=image/svg+xml',
        },
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
    ],
  },
  resolve: {
    modules: [
      'node_modules',
      // Since I am using absolute import for custom modules/js. So this is required.
      'app',
      'app/unify',
      'app/web/src',
    ],
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    ...(PROD ? prodPlugins : devPlugins),
    new CleanWebpackPlugin(),
    // Since I have hashed frontEnd js/css, so this generates assets info file on root and
    // which has assets info.
    new AssetsPlugin({
      path: config.root,
      filename: 'web-frontend-assets.json',
      prettyPrint: true,
    }),
    new webpack.DefinePlugin({
      // To resolve this error on production build.
      // "You are currently using minified code outside of NODE_ENV === 'production'"
      'process.env': {
        NODE_ENV: JSON.stringify(PROD ? 'production' : 'development'),
        PLATFORM: JSON.stringify(process.env.PLATFORM),
        WEB_ENV: JSON.stringify(process.env.WEB_ENV),
      },
      __CLIENT__: true,
      __SERVER__: false,
      __DEVELOPMENT__: process.env.NODE_ENV !== 'production',
    }),
  ],
  devServer: {
    https: {
      key: fs.readFileSync(`${config.webRoot}/certs/key.pem`),
      cert: fs.readFileSync(`${config.webRoot}/certs/cert.pem`),
    },
    host: 'my-domain.com',
    port: '443',
    quiet: true,
    inline: true,
    hot: true,
    compress: true, // <- Enables HMR in webpack-dev-server and in libs running in the browser
    historyApiFallback: true,
    disableHostCheck: true,
    clientLogLevel: 'silent',
    publicPath: `https://my-domain.com:443/dist/`,
    contentBase: `https://my-domain.com:443`,
    headers: { 'Access-Control-Allow-Origin': '*' },
    stats: { colors: true },
  },
  node: false,
  stats: {
    preset: 'detailed',
    assets: true,
    builtAt: true,
    moduleAssets: false,
    assetsSpace: 15,
    modulesSpace: 15,
    colors: true,
    env: true,
    errors: true,
    errorDetails: true,
    errorStack: true,
    reasons: true,
    modules: true,
  },
};
