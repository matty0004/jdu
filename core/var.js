var { doAuth, generateLog, partyApi, doLog, shareLog, getSysStats } = require("./panel");
const axios = require('axios')
const fs = require('fs')

const main = {
  skupackages: require('../database/Platforms/jd2017-pc/sku-packages.json'),
  entities: require('../database/v2/entities.json'),
  configuration: require('../database/v1/configuration.json'),
  subscription: require('../database/db/subscription.json'),
  packages: require('../database/packages.json'),
  block: require('../database/carousel/block.json'),
  leaderboard: require("../database/db/leaderboard.json"),
  questdb: require("../database/quests.json"),
  items: require("../database/db/items.json"),
  upsellvideos: require("../database/carousel/pages/upsell-videos.json"),
  dance_machine: require("../database/db/dance_machine.json"),
  avatars: require("../database/db/avatars.json"),
  create_playlist: require("../database/carousel/pages/create_playlist.json"),
  gchunk: {},
  songdb: { "2016": {}, "2017": {}, "2018": {}, "2019": {}, "2020": {}, "2021": {}, "2022": {} },
  localisation: require('../database/Platforms/jdparty-all/localisation.json')
}


//Songdbs Property
const songdbF = {}
songdbF.multimpd = {
  "videoEncoding": {
    "vp8": "<?xml version=\"1.0\"?>\r\n<MPD xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"urn:mpeg:DASH:schema:MPD:2011\" xsi:schemaLocation=\"urn:mpeg:DASH:schema:MPD:2011\" type=\"static\" mediaPresentationDuration=\"PT30S\" minBufferTime=\"PT1S\" profiles=\"urn:webm:dash:profile:webm-on-demand:2012\">\r\n\t<Period id=\"0\" start=\"PT0S\" duration=\"PT30S\">\r\n\t\t<AdaptationSet id=\"0\" mimeType=\"video/webm\" codecs=\"vp8\" lang=\"eng\" maxWidth=\"720\" maxHeight=\"370\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" bitstreamSwitching=\"true\">\r\n\t\t\t<Representation id=\"0\" bandwidth=\"495833\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/WorthIt/WorthIt_MapPreviewNoSoundCrop_LOW.vp8.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1110\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"1\" bandwidth=\"1478538\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/WorthIt/WorthIt_MapPreviewNoSoundCrop_MID.vp8.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"622-1112\">\r\n\t\t\t\t\t<Initialization range=\"0-622\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"2\" bandwidth=\"2880956\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/WorthIt/WorthIt_MapPreviewNoSoundCrop_HIGH.vp8.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"622-1112\">\r\n\t\t\t\t\t<Initialization range=\"0-622\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"3\" bandwidth=\"3428057\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/WorthIt/WorthIt_MapPreviewNoSoundCrop_ULTRA.vp8.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"622-1112\">\r\n\t\t\t\t\t<Initialization range=\"0-622\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t</AdaptationSet>\r\n\t</Period>\r\n</MPD>\r\n",
    "vp9": "<?xml version=\"1.0\"?>\r\n<MPD xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"urn:mpeg:DASH:schema:MPD:2011\" xsi:schemaLocation=\"urn:mpeg:DASH:schema:MPD:2011\" type=\"static\" mediaPresentationDuration=\"PT30S\" minBufferTime=\"PT1S\" profiles=\"urn:webm:dash:profile:webm-on-demand:2012\">\r\n\t<Period id=\"0\" start=\"PT0S\" duration=\"PT30S\">\r\n\t\t<AdaptationSet id=\"0\" mimeType=\"video/webm\" codecs=\"vp9\" lang=\"eng\" maxWidth=\"720\" maxHeight=\"370\" subsegmentAlignment=\"true\" subsegmentStartsWithSAP=\"1\" bitstreamSwitching=\"true\">\r\n\t\t\t<Representation id=\"0\" bandwidth=\"648085\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/WorthIt/WorthIt_MapPreviewNoSoundCrop_LOW.vp9.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1111\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"1\" bandwidth=\"1492590\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/WorthIt/WorthIt_MapPreviewNoSoundCrop_MID.vp9.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1111\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"2\" bandwidth=\"2984529\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/WorthIt/WorthIt_MapPreviewNoSoundCrop_HIGH.vp9.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1111\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t\t<Representation id=\"3\" bandwidth=\"5942260\">\r\n\t\t\t\t<BaseURL>jmcs://jd-contents/WorthIt/WorthIt_MapPreviewNoSoundCrop_ULTRA.vp9.webm</BaseURL>\r\n\t\t\t\t<SegmentBase indexRange=\"621-1118\">\r\n\t\t\t\t\t<Initialization range=\"0-621\" />\r\n\t\t\t\t</SegmentBase>\r\n\t\t\t</Representation>\r\n\t\t</AdaptationSet>\r\n\t</Period>\r\n</MPD>\r\n"
  }
}


songdbF.missingAssets = { pc: [] }
songdbF.assetsPlaceholder = {
  "banner_bkgImageUrl": "https://cdn.discordapp.com/attachments/1119503808653959218/1119518680733192222/New_Project_82_Copy_0ED1403.png",
  "coach1ImageUrl": "https://jd-s3.akamaized.net/public/map/WantUBack/x1/WantUBack_Coach_1.tga.ckd/5e3b1feb1e38f523cbab509a1590df59.ckd",
  "coverImageUrl": "https://jd-s3.akamaized.net/public/map/WantUBack/x1/WantUBack_Cover_Generic.tga.ckd/f61d769f960444bec196d94cfd731185.ckd",
  "cover_1024ImageUrl": "https://jd-s3.akamaized.net/public/map/WantUBack/WantUBack_Cover_1024.png/9e82873097800b27569f197e0ce848cd.png",
  "cover_smallImageUrl": "https://cdn.discordapp.com/attachments/1119503808653959218/1119518681039384627/New_Project_82_8981698.png",
  "expandBkgImageUrl": "https://jd-s3.akamaized.net/public/map/WantUBack/x1/WantUBack_Cover_AlbumBkg.tga.ckd/6442844a971a9690bd2bf43f1f635696.ckd",
  "expandCoachImageUrl": "https://jd-s3.akamaized.net/public/map/WantUBack/x1/WantUBack_Cover_AlbumCoach.tga.ckd/dc01eb7b94e0b10c0f52a0383e51312e.ckd",
  "phoneCoach1ImageUrl": "https://jd-s3.akamaized.net/public/map/WantUBack/WantUBack_Coach_1_Phone.png/5541105eacbc52648bd1462e564d2680.png",
  "phoneCoverImageUrl": "https://cdn.discordapp.com/attachments/1119503808653959218/1119518681039384627/New_Project_82_8981698.png",
  "videoPreviewVideoURL": "",
  "map_bkgImageUrl": "https://cdn.discordapp.com/attachments/1119503808653959218/1119518680733192222/New_Project_82_Copy_0ED1403.png"
}
songdbF.generateSongdb = function (platform = 'pc', version = '2017') {
  songdbF.db = require('../database/Platforms/jdparty-all/songdbs.json')
  const newdb = {}
  if (parseInt(version) > 2020) {
    Object.keys(songdbF.db).forEach(element => {
      var song = songdbF.db[element]
      var assets = songdbF.getAsset(platform, element)
      if (assets !== songdbF.assetsPlaceholder) {
        song.assets = assets
      }
      song.mapPreviewMpd = songdbF.multimpd
      if (song.customTypeNameId) song.customTypeName = main.localisation[song.customTypeNameId]
      newdb[element] = song
    });
  }
  if (parseInt(version) < 2020) {
    Object.keys(songdbF.db).forEach(codename => {
      var song = songdbF.db[codename]
      var assets = songdbF.getAsset(platform, codename)
      if (assets !== songdbF.assetsPlaceholder) {
        song.assets = assets
      }
      song.mapPreviewMpd = songdbF.multimpd
      if (song.customTypeNameId) song.customTypeName = main.localisation[song.customTypeNameId]
      newdb[codename] = song
    });
  }
  return newdb
}
songdbF.tempAssets = {
  "banner_bkgImageUrl": "https://media.discordapp.net/attachments/1156153836994580500/1156164828713455647/New_Project_77_64F6292.png",
  "coach1ImageUrl": "",
  "coverImageUrl": "https://media.discordapp.net/attachments/1156153836994580500/1156164828713455647/New_Project_77_64F6292.png",
  "coverKidsImageUrl": "",
  "coverKids_smallImageUrl": "",
  "cover_1024ImageUrl": "https://media.discordapp.net/attachments/1156153836994580500/1156164828713455647/New_Project_77_64F6292.png",
  "cover_smallImageUrl": "https://media.discordapp.net/attachments/1156153836994580500/1156164828713455647/New_Project_77_64F6292.png",
  "expandBkgImageUrl": "",
  "expandCoachImageUrl": "",
  "map_bkgImageUrl": "https://media.discordapp.net/attachments/1156153836994580500/1156164828713455647/New_Project_77_64F6292.png",
  "phoneCoach1ImageUrl": "",
  "phoneCoverImageUrl": "https://media.discordapp.net/attachments/1156153836994580500/1156164828713455647/New_Project_77_64F6292.png"
}
songdbF.getAsset = function (platform, codename, style = false) {
  var CurrentPlatform = platform
  if (platform == 'pc') { CurrentPlatform = 'x1' }
  var platformAssets = songdbF.db[codename].assets[CurrentPlatform] || songdbF.db[codename].assets.common || songdbF.assetsPlaceholder;
    if (songdbF.areAllValuesEmpty(platformAssets)) return songdbF.assetsPlaceholder;
    if (style == true || !platformAssets.banner_bkgImageUrl || platformAssets.banner_bkgImageUrl == "") platformAssets.banner_bkgImageUrl = platformAssets.map_bkgImageUrl
    return platformAssets

}
songdbF.generate = function () {
  Object.keys(main.songdb).forEach((version) => {
    const a = {}
    a.pc = songdbF.generateSongdb('pc', version)
    a.ps4 = songdbF.generateSongdb('ps4', version)
    a.nx = songdbF.generateSongdb('nx', version)
    a.pcparty = songdbF.generateSongdb('pc', version, true)
    main.songdb[version] = a
  })
}
songdbF.areAllValuesEmpty = function (obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== "") {
      return false;
    }
  }
  return true;
}
songdbF.generate()

module.exports = {
  main
}