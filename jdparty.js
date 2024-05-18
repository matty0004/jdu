// Just Dance Party Core
// v1.0
//This server core is private and never mean to be used in another mod!
//This file created on 27,March,2023

const express = require("express");
const app = express();
console.log(`[PARTY] Starting daemon`);
process.title = "JDPartyServer";

var settings = require("./settings.json");
const core = require("./core/core");
const port = settings.server.forcePort
  ? settings.server.port
  : process.env.PORT || settings.server.port;

//Initialize Express.js
const server = app.listen(port, () => {
  core.init(app, express, server);
  console.log(`[PARTY] listening on port ${port}`);
  console.log(`[PARTY] Open panel to see more log`);
  core.shareLog("PARTY", `listening on port ${port}`);
});
