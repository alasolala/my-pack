const fs = require('fs')
const path = require('path')
const { SyncHook } = require('tapable')
const parser = require('./parser')

class Compiler{
  constructor (config) {
    this.config = config
    this.entry = config.entry
    this.output = config.output

    this.execPath = process.cwd()

    this.modules = Object.create(null)

    this.hooks = {
      emit: new SyncHook(),  //生成资源到 output 文件之前触发
      afterEmit: new SyncHook()  //生成资源到 output 文件之后触发
    }
    const plugins = this.config.plugins
    if(Array.isArray(plugins)){
      plugins.forEach((plugin) => {
        plugin.apply(this)
      })
    }
  }

  run () {
    this.buildModule(path.resolve(this.execPath, this.entry))
    this.hooks.emit.call()
    this.emitFile()
    this.hooks.afterEmit.call()
  }

  buildModule (filename) {
    let key = path.relative(this.execPath, filename)
    key = './' +  key.replace(/\\/g,'/')
    if(this.modules[key]) return

    const { dependencies, code } = parser.parse(filename,this.config)
    this.modules[key] = {
      code: code,
      dependencies: dependencies
    }
    dependencies.forEach((dependency) => {
      const absPath = path.resolve(this.execPath, dependency)
      this.buildModule(absPath)
    })
  }

  emitFile () {
    const output = path.resolve(this.output.path,this.output.filename)
    let modules = ''
    Object.keys(this.modules).forEach((key) => {
      modules += `'${key}': function(require, module, exports){
        ${this.modules[key].code}
      },`

    })
    const bundle = `(function(modules){
      var installedModules = {}
      function require(filename){
        if(installedModules[filename]) {
			    return installedModules[filename].exports;		
        }

        var module = installedModules[filename] = {
          exports: {} 
        };

        var fn = modules[filename]

        fn(require, module, module.exports)
        return module.exports
      }
      require('${this.entry}')
    })({
      ${modules}
    })`
    fs.writeFileSync(output, bundle, 'utf-8')
  }
}

module.exports = Compiler