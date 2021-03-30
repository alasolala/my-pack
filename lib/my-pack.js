const path = require("path")
const Compiler = require("./Compiler")

let configPath = path.resolve(process.cwd(), './webpack/config.js')

const argv = process.argv
const index = argv.findIndex((value) => value === '--config')
if(index >= 0 && argv[index+1]){
  configPath = path.resolve(process.cwd(), argv[index+1])
}

const config = require(configPath)
const compiler = new Compiler(config)

compiler.run()
