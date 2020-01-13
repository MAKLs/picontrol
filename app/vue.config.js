// Vue configuration
module.exports = {
  // Progressive Web App config
  pwa: {
    name: "Pihole Control",
    themeColor: "#101010",
    msTileColor: "#101010",
    appleMobileWebAppCapable: "yes",
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: "./src/sw.js",
      swDest: "service-worker.js"
    }
  },
  devServer: {
    host: "localhost",
    port: 8085,
    https: true
  },
  configureWebpack: {
    devtool: "source-map"
  },
  productionSourceMap: false
};
