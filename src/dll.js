const path = require('path')
const { merge, isObject, normalizeEntry, getManifestJson } = require('./helper')
module.exports = class DLL {
    constructor(webpackConfig = {}, dllConfig = {}) {
        this.webpackConfig = webpackConfig
        this.entry = null
        this.outputPath = ''
        this.context = webpackConfig.context
        this.isCommand = false
        this.isOpen = false
        merge(this, DLL.getDefaultConfig())
        
        this.dllConfig = merge(DLL.getDLLDefaultConfig(), dllConfig)
        this.isInject = this.dllConfig.isInject

        this.initEntry()
        this.initOutputPath()
        this.initOpen()
    }

    static getDLLDefaultConfig() {
        const DEFAULT_OUTPUT_PATH = path.join(this.context, './public', this.outputDir)
        return {
            outputPath: DEFAULT_OUTPUT_PATH,
            open: true,
            isInject: true
        }
    }

    static getDefaultConfig() {
        return {
            manifest: '[name].manifest.json',
            // output fileName
            filename: '[name].[hash:8].dll.js',
            // common library name
            library: '[name]_library',
            // the name of directory specified after output
            outputDir: 'dll'
        }
    }

    initEntry() {
        this.entry = normalizeEntry(this.dllConfig.entry)
    }

    initOutputPath() {
        let outputPath = this.dllConfig.outputPath

        if (typeof outputPath === 'string') {
            outputPath = {
                path: outputPath
            }
        }

        if (outputPath && !isObject(outputPath)) {
            outputPath = null
            console.warn('Type check failed for dllconfig\'s outputPath parameter, expected Object or String')
        }

        if (outputPath && outputPath.path && typeof outputPath.path === 'string') {
            this.outputPath = outputPath.path
        }
    }

    initOpen() {
        const { open } = this.dllConfig
        this.isOpen = open === true ? this.validateEntry() : false
    }

    validateEntry(entry = {}) {
        return !!Object.keys(entry).length
    }

    callCommand() {
        this.isCommand = true
    }

    resolveRelativePath(path) {
        return path.resolve(this.outputPath, path)
    }

    resolveEetry() {
        return JSON.parse(JSON.stringify(this.entry))
    }

    resolveOutput() {
        return {
            path: this.outputDir,
            fileName: this.fileName,
            library: this.library
        }
    }

    resolveDllArgs() {
        return [{

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

    }
}