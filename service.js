const webpack = require('webpack')
const DLL = require('./src/dll')

module.exports = (api, options) => {
    const { pluginOptions } = options
    const dllConfig = pluginOptions && pluginOptions.dll || {}
    const dllInstance = new DLL(api.resolveWebpackConfig(), dllConfig)

    api.chainWebpack(config => {
        if (!dllInstance.isOpen || dllInstance.isCommand === true) return
        const referenceArgs = dllInstance.resolveDllReferenceArgs()

        config.when(referenceArgs.length !== 0, config => {
            referenceArgs.forEach(args => {
                config
                    .plugin(`dll-reference-${args.manifest.name}`)
                    .use(webpack.DllReferencePlugin, [args])
            })

            if (dllInstance.isInject) {
                config
                    .plugin('dll-add-assets-html')
                    .use(
                        rquire('add-asset-html-webpack-plugin'),
                        dllInstance.resolveAddAssetHtmlArgs()
                    )
                    
                config.plugin('copy').tap(args => {

                })    
            }
        })
    })

    api.registerCommand(
        'dll',
        {
            description: 'Build dll',
            usage: 'vue-cli-service dll'
        },
        () => {

        }
    )
}

module.exports.defaultModes = {
    dll: 'production'
}