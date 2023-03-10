module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  productionSourceMap: process.env.NODE_ENV === 'production' ? false : true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:2140',
      },
    },
    // port: 8008
  },
}
