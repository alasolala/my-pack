const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
class HtmlPlugin {  
  constructor (options) {
    this.template = options.template
    this.filename = options.filename
  }

  apply (compiler) {
    compiler.hooks.afterEmit.tap('afterEmit',() => {
      const template = fs.readFileSync(path.resolve(process.cwd(),this.template), 'utf-8')
      const $ = cheerio.load(template)

      const script = $(`<script src='./${compiler.output.filename}'></script>`)
      $('body').append(script)
      
      const htmlFile = $.html()
      const output = path.resolve(compiler.output.path,this.filename)
      fs.writeFileSync(output, htmlFile, 'utf-8')
    })
  }
}

module.exports = HtmlPlugin
