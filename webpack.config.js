const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { dependencies } = require('./package.json');

module.exports = {
  entry: {
    embed: './src/embed.ts',
    module: './src/module.ts',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: path.join('embed-chunks', '[chunkhash].js'),
    clean: true,
    publicPath: '',
    library: {
      type: 'commonjs',
    },
  },
  plugins: process.env.ANALYZE === 'true' ? [new BundleAnalyzerPlugin()] : [],
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: {
          loader: 'svg-inline-loader',
        },
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  externals: Object.keys(dependencies).reduce((acc, dep) => {
    acc[dep] = dep;
    return acc;
  }, {}),
};
