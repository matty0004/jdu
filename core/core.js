// Just Dance Party Core
// This server core is private and never mean to be used in another mod!
var { main } = require('./var')
var { doAuth, generateLog, partyApi, doLog, shareLog, getSysStats } = require("./panel");
var fs = require("fs");  // require https module


function init(app, express) {
    const bodyParser = require("body-parser");
    app.use(express.json());
    app.use(bodyParser.raw());
    app.use(generateLog);
    app.use((err, req, res, next) => {
        shareLog('ERROR', `${err.stack}`)
        res.status(500).send('Internal Server Error');
    });

    //initialize route module
    require('./route/rdefault').initroute(app);
    require('./wdf/wdf').initroute(app);
    require('./route/account').initroute(app);
    
    //hide error when prod 
    app.get('*', function(req, res){
     res.status(404).send({
       'error': 404,
       'message': 'Path Not Recognized',
       'discord': 'https://discord.gg/RaXaKTmHpV'
     });
    });
}

module.exports = {
    main, init,
    doAuth, generateLog, partyApi, doLog, shareLog
}

shareLog('PARTY', `Core: Initialization Done on ${getSysStats().platform} 🎉`)