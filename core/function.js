//JDPARTY CLONE OBJECT
const fs = require('fs');
const axios = require('axios');
const downloader = {
};
function CloneObject(ObjectC) {
    return JSON.parse(JSON.stringify(ObjectC))
}
function readDatabaseJson(path) {
    return JSON.parse(fs.readFileSync(`${__dirname}/../database/${path}`, 'utf8'));
}


downloader.getJson = async (url, options) => {
  const response = await axios.get(url, options);
  return response.data;
}

module.exports = {
    CloneObject, readDatabaseJson, downloader
}