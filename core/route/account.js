const fs = require("fs");
const https = require("https");
const axios = require("axios");
const v1 = require("../../database/v1/configuration.json");
const v2 = require("../../database/v2/entities.json");
const v3 = require("../../database/v3/users/6358f50e-7b45-4b06-a559-35075a7d58b2.json");

function initroute(app) {
  var ubiwsurl = "https://public-ubiservices.ubi.com";
  var prodwsurl = "https://jmcs-prod.just-dance.com";
  

  // Profiles
app.get("/profile/v2/profiles", (req, res) => {
  var auth = req.header("Authorization");
  const httpsopts = {
    hostname: "prod.just-dance.com",
    port: 443,
    path: "/profile/v2/profiles?profileIds=" + req.query.profileIds,
    method: "GET",
    headers: {
      "User-Agent": "UbiServices_SDK_2017.Final.28_SWITCH64",
      Accept: "*/*",
      Authorization: auth,
      "Content-Type": "application/json",
      "X-SkuId": "jd2019-nx-all",
    },
  };
  redirect(httpsopts, "", function (redResponse) {
    res.send(redResponse);
  });
});

app.post("/profile/v2/profiles", function (req, res) {
  res.redirect(307, "https://prod.just-dance.com/profile/v2/profiles");
});

app.post("/profile/v2/map-ended", (req, res) => {
  var auth = req.header("Authorization");
  var codename = req.body;
  for (let i = 0; i < codename.length; i++) {
    var song = codename[i];
  }
  if (fs.existsSync("./cosmos-functions/v1/dancer-of-the-week/" + song.mapName + ".json")) {
    const readFile = fs.readFileSync(
      "./cosmos-functions/v1/dancer-of-the-week/" + song.mapName + ".json"
    );
    var JSONParFile = JSON.parse(readFile);
    if (JSONParFile.score > song.score) {
      res.send(`1`);
    }
  }
  else {
    var ticket = req.header("Authorization");
    var xhr33 = new XMLHttpRequest();
    xhr33.open(req.method, prodwsurl + req.url, true);
    xhr33.setRequestHeader("X-SkuId", "jd2019-nx-all");
    xhr33.setRequestHeader("Authorization", ticket);
    xhr33.setRequestHeader("Content-Type", "application/json");
    xhr33.send(JSON.stringify(req.body), null, 2);
    var getprofil1 = xhr33.responseText.toString();
    for (let i = 0; i < getprofil1.length; i++) {
      var profiljson = getprofil1[i];
    }
    
    console.log(profiljson)

    // Creates the local DOTW file
    var profiljson1 = JSON.parse(profiljson);
    console.log(profiljson1)
    var jsontodancerweek = {
      __class: "DancerOfTheWeek",
      score: song.score,
      profileId: profiljson1.profileId,
      gameVersion: "jd2019",
      rank: profiljson1.rank,
      name: profiljson1.name,
      avatar: profiljson1.avatar,
      country: profiljson1.country,
      platformId: profiljson1.platformId,
      //"platformId": "2535467426396224",
      alias: profiljson1.alias,
      aliasGender: profiljson1.aliasGender,
      jdPoints: profiljson1.jdPoints,
      portraitBorder: profiljson1.portraitBorder,
    };
    fs.writeFile("./cosmos-functions/v1/dancer-of-the-week/" + song.mapName + ".json", jsontodancerweek,function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("DOTW file for" + song.mapName + "created!");
        }
      }
    );

    res.send(profiljson);
  }
});

// Your dancer profile
app.post("/carousel/v2/pages/dancerprofile", (req, res) => {
  var auth = req.header("Authorization");
  const httpsopts = {
    hostname: "prod.just-dance.com",
    port: 443,
    path: "/carousel/v2/pages/dancerprofile",
    method: "POST",
    headers: {
      "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
      Accept: "*/*",
      "Accept-Language": "en-us,en",
      Authorization: auth,
      "Content-Type": "application/json",
      "X-SkuId": "jd2019-nx-all",
    },
  };
  redirect(httpsopts, req.body, function (redResponse) {
    res.send(redResponse);
  });
});

// Friends's dancer profiles
app.post("/carousel/v2/pages/friend-dancerprofile", (req, res) => {
  var json = JSON.stringify(req.body);
  var auth = req.header("Authorization");
  const httpsopts = {
    hostname: "prod.just-dance.com",
    port: 443,
    path: "/carousel/v2/pages/friend-dancerprofile?pid=" + req.query.pid,
    method: "POST",
    headers: {
      "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
      Accept: "*/*",
      "Accept-Language": "en-us,en",
      Authorization: auth,
      "Content-Type": "application/json",
      "X-SkuId": "jd2019-nx-all",
    },
  };
  redirect(httpsopts, json, function (redResponse) {
    res.send(redResponse);
  });
});

// Banned players (taken from Ubisoft's servers)
app.post("/profile/v2/filter-players", function (request, response) {
  response.send(
    '["e75ad5ae-56d9-4361-9cdb-4831241335ab", "e3ec7209-242d-4c17-af1e-423de5288d6d", "73bae7d1-7713-48f8-a62d-7e8c73f0577a", "c9e6b976-46d9-4f2d-80b4-cc06a6fa7c9f", "14b2d506-a938-4451-b9f6-2c2115122a4e", "e970f896-5681-4bfe-9e07-c2a45c3ece67", "ee818be8-dcf3-42a6-9684-6f4fa2b641f1"]'
  );
});

// Country
var requestCountry = require("request-country");
app.get("/profile/v2/country", function (request, response) {
  var country = requestCountry(request);
  if (country == false) {
    country = "MX";
  }
  response.send('{ "country": "' + country + '" }');
});

// v1
app.get(
  "/:version/applications/:appid/configuration",
  function (request, response) {
    response.send(v1);
  }
);

// v2
app.get("/:version/spaces/:spaceid/entities", function (request, response) {
  response.send(v2);
});

// v3
app.get("/:version/users/:user", (req, res) => {
  var auth = req.header("Authorization");
  var sessionid = req.header("Ubi-SessionId");
  const httpsopts = {
    hostname: "public-ubiservices.ubi.com",
    port: 443,
    path: "/v3/users/" + req.params.user,
    method: "GET",
    headers: {
      "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
      Accept: "*/*",
      Authorization: auth,
      "Content-Type": "application/json",
      "ubi-appbuildid": "BUILDID_259645",
      "Ubi-AppId": req.header("Ubi-AppID"),
      "Ubi-localeCode": "en-us",
      "Ubi-Populations": "US_EMPTY_VALUE",
      "Ubi-SessionId": sessionid,
    },
  };
  redirect(httpsopts, "", function (redResponse) {
    res.send(redResponse);
  });
});

app.post("/:version/users/:user", (req, res) => {
  var auth = req.header("Authorization");
  var sessionid = req.header("Ubi-SessionId");
  const httpsopts = {
    hostname: "public-ubiservices.ubi.com",
    port: 443,
    path: "/v3/users/" + req.params.user,
    method: "GET",
    headers: {
      "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
      Accept: "*/*",
      Authorization: auth,
      "Content-Type": "application/json",
      "ubi-appbuildid": "BUILDID_259645",
      "Ubi-AppId": "341789d4-b41f-4f40-ac79-e2bc4c94ead4",
      "Ubi-localeCode": "en-us",
      "Ubi-Populations": "US_EMPTY_VALUE",
      "Ubi-SessionId": sessionid,
    },
  };
  redirect(httpsopts, "", function (redResponse) {
    res.send(redResponse);
  });
});

// Función para redireccionar a otros sitios
// Es necesario un options que contiene los detalles de ruta, la manera (GET, POST) y la dirección
function redirect(options, write, callback) {
  var Redirect = https.request(options, (response) => {
    response.on("data", (data) => {
      callback(data);
    });
  });
  Redirect.on("error", (e) => {
    console.log(e);
  });
  Redirect.write(write);
  Redirect.end();
}
}

module.exports = { initroute };
