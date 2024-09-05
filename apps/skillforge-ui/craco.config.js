// see https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration-overview
const webpack = require('webpack')
const WorkBoxPlugin = require('workbox-webpack-plugin');
// 8MB
const preCachedLimitInBytes = 8*1024*1024
module.exports = {
  babel: {
    plugins: ['@babel/plugin-proposal-nullish-coalescing-operator']
  },
  webpack: {
    plugins: [],
    // https://webpack.js.org/configuration
    configure: (config) => {
      const fallback = config.resolve.fallback || {}
      Object.assign(fallback, {
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        https: require.resolve('https-browserify'),
        stream: require.resolve('stream-browserify'),
        // path: require.resolve("path-browserify"),
        http: require.resolve('stream-http'),
        os: require.resolve('os-browserify'),
        url: require.resolve('url'),
        vm: require.resolve("vm-browserify"),
        zlib: require.resolve('browserify-zlib')
      })
      config.resolve.fallback = fallback
      config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer']
        })
      ])

      // Bundle size warning bypass
      config.plugins.forEach(plugin => {
        if ( plugin instanceof WorkBoxPlugin.InjectManifest) {
          // 8MB
          plugin.config.maximumFileSizeToCacheInBytes = preCachedLimitInBytes;
        }
      })

      config.ignoreWarnings = [/Failed to parse source map/]
      config.module.rules.push({
        test: /\.(ts|tsx|js|mjs|jsx)$/,
        enforce: 'pre',
        loader: require.resolve('source-map-loader'),
        resolve: {
          fullySpecified: false
        }
      })

      return config
    }
  }
}
