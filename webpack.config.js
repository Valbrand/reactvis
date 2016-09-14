const path = require('path');
// const autoprefixer = require('autoprefixer');

module.exports = {
  devtool: 'source-map',

  resolve: {
    extensions: [ '', '.js', '.jsx' ],
  },

  module: {
    preLoaders: [
      {
        test: /.js$/,
        loader: 'source-map-loader',
      },
    ],
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: { presets: [ 'es2015', 'react' ] },
      },
      /*{
        test: /.scss$/,
        loaders: [ 'style', 'css', 'postcss', 'sass' ],
      },*/
    ],
  },
  /*postcss () {
    return [autoprefixer];
  },*/
};
