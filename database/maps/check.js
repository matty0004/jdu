var sdb = require('../Platforms/jd2017-pc/songdbs.json');
var ahud = require('./chunk.json');
var bhud = Object.keys(ahud);

var missingElements = [];

for (var key in sdb) {
  if (sdb.hasOwnProperty(key)) {
    if (bhud.indexOf(key) === -1) {
      missingElements.push(key);
    }
  }
}

console.log(JSON.stringify(missingElements));
