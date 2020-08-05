const path = require('path')
const {
    merge, 
    isObject,
    normalizeEntry,
    getManifestJson,
    replaceAsyncName,
    getAssetHtmlPluginDefaultArg,
    isAcceptTypeByAssetPluginByPath,
    compose
} = require('./helper')

const {

} = require('')

module.exports = class DLL {
    constructor(webpackConfig = {}, dllConfig = {}) {
        this.webpackConfig = webpackConfig
        this.entry = null
        this.outputPath = ''
        this.context = webpackConfig.context
        this.isCommand = false
        this.isOpen = false
        this.isInject = false
        this.defaultDLLConfig = {
            open: true,
            inject: true,
            cacheFilePath: ''
        }
        this.defaultConfig = {
            manifest: '[name].manifest.json',
            // output fileName
            filename: '[name].[hash:8].dll.js',
            // common library name
            library: '[name]_library',
            // the name of directory specified after output
            outputDir: 'dll'
        }
        merge(this, this.defaultConfig)
        this.dllConfig = merge({}, this.defaultDLLConfig, dllConfig)

        this.init()
    }

    init() {
        this.initEntry()
        this.initOutputPath()
        this.initOpen()
        this.initInject()
        this.initCachePath()
    }

    initEntry() {
        this.entry = normalizeEntry(this.dllConfig.entry)
    }

    initOutputPath() {
        let output = this.dllConfig.output

        if (typeof output === 'string') {
            output = {
                path: output
            }
        }

        if (output && !isObject(output)) {
            output = null
            console.warn('Type check failed for dllconfig\'s outputPath parameter, expected Object or String')
        }
        const DEFAULT_OUTPUT_PATH = path.join(this.context, './public', this.outputDir)

        if (output && output.path && typeof output.path === 'string') {
            this.outputPath = output.path
        } else {
            this.outputPath = DEFAULT_OUTPUT_PATH
        }
    }

    initOpen() {
        const { open } = this.dllConfig
        this.isOpen = !!open ? this.validateEntry() : false
    }

    initInject() {
        this.isInject = !!this.dllConfig.inject
    }

    initCachePath() {
        let cacheFilePath = this.dllConfig.cacheFilePath
        if (cacheFilePath) {
            setCacheFileNamePath(cacheFilePath)
        }
    }

    validateEntry() {
        return !!Object.keys(this.entry).length
    }

    callCommand() {
        this.isCommand = true
    }

    resolveRelativePath(path) {
        return path.resolve(this.outputPath, path)
    }

    resolveEntry() {
        return JSON.parse(JSON.stringify(this.entry))
    }

    resolveOutput() {
        return {
            path: this.outputPath,
            filename: this.filename,
            library: this.library
        }
    }

    resolveDllArgs() {
        return [{
            path: this.resolveRelativePath(this.manifest),
            name: this.library
        }]
    }

    resolveDllReferenceArgs() {
        return Object.keys(this.resolveEntry())
            .map(entryName => {
                const path = this.resolveRelativePath(this.manifest.replace('[name]', entryName))
                return getManifestJson(path)
            })
            .filter(i => !!i)
            .map(manifest => {
                return {
                    manifest,
                    context: this.context
                }
            })
    }

    resolveAddAssetHtmlArgs() {
        const dllInstance = this
        const fn = this.resolveRelativePath.bind(this)
        const sourceList = getCacheFileNameList().map(fn)

        let assetHtmlPluginArg
        function _(filename) {
            return getAssetHtmlPluginDefaultArg(filename, dll)
        }

        if (sourceList.length > 0) {
            assetHtmlPluginArg = sourceList.filter(isAcceptTypeByAssetPluginByPath)
            .map(_)
        } else {
            console.warn('您更新最新版本，请您重新构建一下dll文件，执行npm run dll')
            assetHtmlPluginArg = compose(_, fn, replaceAsyncName)(this.filename)
        }
        return [assetHtmlPluginArg]
    }
}