const log = msg => {
    msg && console && console.log && console.log(msg)
}

const isObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]'
}

const merge = (target, ...sources) => {
    if(!isObject(target)) return target
    sources.forEach(source => {
        if (!isObject(source)) return
        Object.keys(source).forEach(key => {
            target[key] = source[key]
        })
    })
    return target
}

const normalizeEntry = (entry = {}) => {
    let resEntry = null
    if (!isObject(entry) && entry) {
        resEntry = {
            dll: entry
        }
    } else {
        resEntry = entry
    }

    Object.keys(resEntry).forEach((key, value) => {
        Array.isArray(value) ? value : [value]
    })

    return resEntry
}

const getManifestJson = (path) => {
    let mainfest = null
    try {
        mainfest = require(path)
    } catch (e) {
        log(' ')
        log('vue-cli-plugin-dll warning!! Missing manifest.json')
        log(' ')
        log(' ')
        log(`not found ${path}`)
        log(' ')
        log(
            `if you want to use DllReferencePlugin，execute the 'npm run dll' command first`
        )
        log(' ')
    }
    return mainfest
}

exports.log = log
exports.isObject = isObject
exports.merge = merge
exports.normalizeEntry = normalizeEntry
exports.getManifestJson = getManifestJson