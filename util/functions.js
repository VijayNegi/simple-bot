const fs = require("fs")
const { builtinModules } = require("module")

const getFiles = (path, ending) => {
    return fs.readdirSync(path).filter(f => f.endsWith(ending))
}
module.exports = {
    getFiles
}