function loader(source){
  const newSource = source.replace(/console\.log\([\s\S]*\)/g,'')
  return newSource
}
module.exports = loader