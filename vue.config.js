const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave:false,
  devServer: {
    port: 9001,
    client: {
      overlay: {
        runtimeErrors: false,
      },
    },
  }
})