//Game
const axios = require('axios');

const core = {
  main: require('../var').main,
  CloneObject: require('../function').CloneObject,
  generateRivalCarousel: require('../carousel/function').generateRivalCarousel,generateSweatCarousel: require('../carousel/function').generateSweatCarousel,generateCreatePlaylistCarousel: require('../carousel/function').generateCreatePlaylistCarousel, generateCoopCarousel: require('../carousel/function').generateCoopCarousel, updateMostPlayed: require('../carousel/function').updateMostPlayed,
  partyApi: require("../panel").partyApi, shareLog: require("../panel").shareLog
}
const path = require('path')

function checkAuth(req, res){
  if(!req.headers["x-skuid"].startsWith("jd") || !req.headers["authorization"].startsWith("Ubi")){
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
    core.shareLog("SECURITY", `Attempt to steal files detected by ${ip}\n${JSON.stringify(req.headers, null, 2)}`)
    res.status(404).send({
       'error': 400,
       'message': 'Bad request! Oops you didn\'t specify what file should we give you, try again',
       'discord': 'https://discord.gg/RaXaKTmHpV'
     });
     
    return false;
  }
  return true;
}

function initroute(app, express, server) {
  app.get("/songdb/v1/songs", (req, res) => {
    if(checkAuth(req, res)){
      if(req.headers["x-skuid"].startsWith("jd2017-pc"))res.send(core.main.songdb['2017'].pc);
      if(req.headers["x-skuid"].startsWith("jd2019-nx"))res.send(core.main.songdb['2019'].nx);
      if(req.headers["x-skuid"].startsWith("jdparty-pc"))res.send(core.main.songdb['2017'].pcparty);
    }
  });

  app.get('/packages/v1/sku-packages', function (req, res) {
  	if(checkAuth(req, res)){
    if(req.headers["x-skuid"].startsWith("jd2017-pc"))res.send(core.main.skupackages);
    if(req.headers["x-skuid"].startsWith("jdparty-pc"))res.send(core.main.skupackages);
    }
  });

  app.post("/carousel/v2/pages/party", (req, res) => {
    res.send(core.CloneObject(core.generateRivalCarousel()))
  });
  app.post("/carousel/v2/pages/sweat", (req, res) => {
    res.send(core.CloneObject(core.generateSweatCarousel()))
  });
  app.post("/carousel/v2/pages/partycoop", (req, res) => {
    res.send(core.CloneObject(core.generateCoopCarousel()))
  });
  app.post("/carousel/v2/pages/create-playlist", (req, res) => {
    res.send(core.CloneObject(core.generateCreatePlaylistCarousel()))
  });
  app.post("/carousel/v2/pages/jdtv", (req, res) => {
    res.send(core.CloneObject(core.generateCarousel()))
  });

  app.post("/carousel/v2/pages/partycoop", (req, res) => {
    res.send(core.main.partycoop)
  });

  app.post("/carousel/v2/pages/sweat", (req, res) => {
    res.send(core.main.sweat)
  });

  app.post("/carousel/v2/pages/jdtv", (req, res) => {
    res.send(core.main.jdtv)
  });

  app.get('/leaderboard/v1/coop_points/mine', function (req, res) {
    res.send(core.main.leaderboard);
  });

  app.get('/:version/spaces/:SpaceID/entities', function (req, res) {
    res.send(core.main.entities);
  });

  app.get('/:version/applications/:appId/configuration', function (req, res) {
    res.send(core.main.configuration);
  });

  app.post("/subscription/v1/refresh", (req, res) => {
    res.send(core.main.subscription);
  });

  app.get("/questdb/v1/quests", (req, res) => {
    res.send(core.main.questdb);
  });

  app.get("/session-quest/v1/", (request, response) => {
    response.send({
      "__class": "SessionQuestService::QuestData",
      "newReleases": []
    });
  });

  app.get("/customizable-itemdb/v1/items", (req, res) => {
    res.send(core.main.items);
  });

  app.post("/carousel/v2/pages/upsell-videos", (req, res) => {
    res.send(core.main.upsellvideos);
  });

  app.get("/constant-provider/v1/sku-constants", (req, res) => {
    res.send(core.main.block);
  });

  app.get("/dance-machine/v1/blocks", (req, res) => {
    res.send(core.main.dance_machine);
  });

  app.get("/status/v1/ping", (req, res) => {
    res.send([]);
  });

  app.get('/content-authorization/v1/maps/*', (req, res) => {
    if (checkAuth(req, res)) {
      var maps = req.url.split("/").pop();

      if (Array.isArray(core.main.gchunk) && core.main.gchunk.includes(maps)) {
        core.shareLog(maps, "using gdrive server.");
        var placeholder = JSON.stringify(core.CloneObject(require('../../database/maps/placeholder.json')))
        placeholder = placeholder.replaceAll("{Placeholder}", maps)
        const nohuds = JSON.parse(placeholder);
        res.send(nohuds);
      } else {
        // Handle the case where core.main.gchunk is not an array or maps is not found in it.
        core.shareLog(maps, "does not exist in gdrive chunk. using from glitch");
        var chunk = require('../../database/maps/chunk.json');
        if (chunk[maps]) {
          var placeholder = core.CloneObject(require('../../database/maps/placeholder.json'));
          placeholder.urls = chunk[maps];
          res.send(placeholder);
        } else {
          core.shareLog(maps, "does not exist in any chunk. returning server error");
          res.status(500).send('Server error: Map not found.');
        }
      }
    }
  });

  app.post("/carousel/v2/packages", (req, res) => {
    res.send(core.main.packages);
  });

  app.get("/com-video/v1/com-videos-fullscreen", (req, res) => {
    res.send([]);
  });

  //JDParty Panel
  app.post('/party/panel/api/:type', function (req, res) {
    core.partyApi(req, res, server);
  });
  app.get('/party/panel/:fileName', function (req, res) {
    const file = path.extname(req.params.fileName) ? req.params.fileName : req.params.fileName + '.html'
    res.sendFile(path.join(__dirname, '../../panel', file));
  });
}

module.exports = {
  initroute
}