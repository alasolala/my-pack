import { msg } from './hello.js'
const worldModule = require('./world.js')
console.log(msg)
console.log('hi ' + worldModule.world)