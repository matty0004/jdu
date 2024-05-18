var requestLogs = [];
const os = require("os");
const settings = require("../settings.json");
const admins = settings.server.admins;
var crypto = require("crypto");
const axios = require("axios"); // Import the axios library
var counted = 0;


const shareLog = (method, data) => {
  const log = {
    method: method,
    url: data,
    timestamp: new Date().toISOString(),
  };
  requestLogs.push(log);
  var dcwebhook =
    "https://discord.com/api/webhooks/1155829649935446136/7RWIG1c4Q5FJhWEdZmWh_AL6Fi67tIm_OZfErpalzz4u7jxTSDIl-eJuKLupHYPEY8vd";

  const message = {
    content: log.timestamp,
    embeds: [
      {
        type: "rich",
        title: log.method,
        description: log.url,
        color: 0x00ffff,
      },
    ],
  };

  axios
    .post(dcwebhook, message)
    .then((response) => {
      // Handle the response if needed
    })
    .catch((error) => {
      // Handle the error if needed
    });
};

//LOG SERVER (NOT FOR STORING DATA, BUT FOR CHECK ERROR)
const generateLog = (req, res, next) => {
  counted++;
  if (!req.url.startsWith("/party/panel/")) {
    const log = {
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
    };
    requestLogs.push(log);
    if (requestLogs.length > 50) {
      requestLogs.shift();
    }
  }
  next();
};

//PANEL FUNCTION
function partyApi(req, res, server) {
  if (req.params.type === "auth") {
    const authResult = doAuth(req);
    if (authResult != "DENIED") {
      res.status(200).send("OK");
    } else {
      res.status(403).send("DENIED");
    }
  } else if (req.params.type === "getlog") {
    const authResult = doAuth(req);
    if (authResult != "DENIED") {
      var isSTD = false;
      if (req.query.c == "true") isSTD = true;
      doLog(req, res, isSTD);
    } else {
      res.status(403).send("DENIED");
    }
  } else if (req.params.type === "restart") {
    const authResult = doAuth(req);
    if (authResult != "DENIED") {
      restartServer(req, res, server);
    } else {
      res.status(403).send("DENIED");
    }
  } else if (req.params.type === "performance") {
    res.status(200).send(getSysStats());
  } else {
    res.status(404).send("Not found");
  }
}

// Get the request logs
function doLog(req, res, isSTD = false) {
  if (isSTD) {
    const path = require("path");
    res.sendFile(path.join(__dirname, "..", "database", "tmp", "logs.txt"));
  } else {
    res.send(requestLogs);
  }
}
function getSysStats() {
  return {
    hostname: os.hostname(),
    freeMem: os.freemem(),
    uptime: os.uptime(),
    loadavg: os.loadavg()[0],
    freeMem: os.freemem(),
    platform: os.platform(),
    suptime: process.uptime(),
    counted,
  };
}
// restart the server
function restartServer(req, res, server) {
  res.send({ status: 200 });
  require("./scripts/update.js").restart(server);
}
// Authenticate the request

function doAuth(req) {
  const auth = {
    a: req.query.a ? crypto.createHash("md5").update(req.query.a).digest("hex") : "",
    b: req.query.b ? crypto.createHash("md5").update(req.query.b).digest("hex") : "",
  };
  for (const admin of admins) {
    if (auth.a && auth.b && auth.a === admin.user && auth.b === admin.pass) {
      if (admin.role == "full") {
        return "FULL";
      }
      return "OK";
    }
  }
  return "DENIED";
}

module.exports = {
  doAuth,
  generateLog,
  partyApi,
  doLog,
  shareLog,
  getSysStats,
};
