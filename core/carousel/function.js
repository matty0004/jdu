const {
  CloneObject,
  readDatabaseJson
} = require("../function");
const fs = require("fs");
const cClass = require("./classList.json");
const songdb = require("../../database/Platforms/jdparty-all/songdbs.json");
const express = require("express");
const app = express();
const path = require('path');
const axios = require('axios');

const downloader = {};

var carousel = {};
var mostPlayed = require(`${__dirname}/../../database/carousel/mostplayed.json`);

var search;

function updateMostPlayed(maps) {
  const weekNumber = getWeekNumber();

  if (!mostPlayed[weekNumber]) {
    mostPlayed[weekNumber] = {};
  }

  mostPlayed[weekNumber][maps] = (mostPlayed[weekNumber][maps] || 0) + 1;

  // Log the selected song
  console.log(`Selected song: ${maps}, Week: ${weekNumber}`);

  // Backup to avoid data loss on server restart
  fs.writeFileSync(
    path.join(__dirname, "../../database/carousel/mostplayed.json"),
    JSON.stringify(mostPlayed, null, 2)
  );
}

function addCategories(categories) {
  carousel.categories.push(Object.assign({}, categories));
}

function generateCategories(name, items, type = "partyMap") {
  const g = Object.assign({}, cClass.categoriesClass);
  g.title = name;
  g.items = generatePartymap(items, type);
  g.items.push(cClass.itemSuffleClass);
  return g;
}

function generatePartymap(arrays, type = "partyMap") {
  return arrays.map(mapName => {
    const m = Object.assign({}, cClass.itemClass);
    m.components = JSON.parse(JSON.stringify(cClass.itemClass.components));
    m.components[0].mapName = mapName;
    m.actionList = type;
    return m;
  });
}

function generateSearchCategory(query) {
  const searchCategory = Object.assign({}, cClass.searchCategoryClass);
  searchCategory.title = `[icon:SEARCH_FILTER] Search`;

  const filteredSongs = filterSongsBySearch(Object.keys(songdb), query);
  filteredSongs.sort((a, b) => (songdb[a].title + songdb[a].mapName).toLowerCase().localeCompare((songdb[b].title + songdb[b].mapName).toLowerCase()));

  searchCategory.items = generatePartymap(filteredSongs);
  return searchCategory;
}

function generateSearchCarousel(query) {
  carousel = CloneObject(cClass.rootClass);
  carousel.actionLists = cClass.actionListsClass;

  const searchCategory = generateSearchCategory(query);
  addCategories(searchCategory);

  // Other sections...

  return carousel;
}

function filterSongsBySearch(songdbs, query) {
  return songdbs.filter((song) => {
    const title = (songdb[song].title + songdb[song].mapName).toLowerCase();
    return title.includes(query.toLowerCase());
  });
}

function filterSongsByFirstLetter(songdbs, filter) {
  const filteredSongdbs = songdbs.filter((song, index) => {
    const title = (songdb[song].title + songdb[song].mapName).toLowerCase();
    const regex = new RegExp(`^[${filter}].*`);
    return regex.test(title);
  });

  // Custom sorting: Sort by title first, then by special suffixes
  filteredSongdbs.sort((a, b) => {
    const titleA = (songdb[a].title + songdb[a].mapName).toLowerCase();
    const titleB = (songdb[b].title + songdb[b].mapName).toLowerCase();
    const specialSuffixes = ["alt", "vip", "swt", "fan", "osc", "oscdlc", "altdlc", "etitgodlc"];

    // Custom logic to handle "KIDS" prefix
    const hasKidsPrefixA = titleA.startsWith("kids");
    const hasKidsPrefixB = titleB.startsWith("kids");

    const suffixIndexA = hasKidsPrefixA
      ? specialSuffixes.length
      : specialSuffixes.findIndex((suffix) => titleA.endsWith(suffix));
    const suffixIndexB = hasKidsPrefixB
      ? specialSuffixes.length
      : specialSuffixes.findIndex((suffix) => titleB.endsWith(suffix));

    if (suffixIndexA !== -1) {
      if (suffixIndexB !== -1) {
        return titleA.localeCompare(titleB);
      } else {
        return 1; // Special suffix comes after other titles
      }
    } else if (suffixIndexB !== -1) {
      return -1; // Other titles come before special suffix
    } else {
      return titleA.localeCompare(titleB);
    }
  });

  return filteredSongdbs;
}

function filterSongsByJDVersion(songdbs, filter) {
  const filteredSongdbs = songdbs.filter((song, index) => {
    const version = songdb[song].originalJDVersion;
    return version === filter;
  });

  // Custom sorting: Sort by title first, then by special suffixes
  filteredSongdbs.sort((a, b) => {
    const titleA = (songdb[a].title + songdb[a].mapName).toLowerCase();
    const titleB = (songdb[b].title + songdb[b].mapName).toLowerCase();
    const specialSuffixes = ["alt", "vip", "ext", "swt", "fan", "osc", "oscdlc", "altdlc", "etitgodlc"];

    // Check if one of the titles has the "KIDS" prefix
    const hasKidsPrefixA = titleA.startsWith("kids");
    const hasKidsPrefixB = titleB.startsWith("kids");

    if (hasKidsPrefixA && !hasKidsPrefixB) {
      return 1; // Title with "KIDS" prefix comes after the other title
    } else if (!hasKidsPrefixA && hasKidsPrefixB) {
      return -1; // Title with "KIDS" prefix comes before the other title
    } else if (hasKidsPrefixA && hasKidsPrefixB) {
      // If both titles have the "KIDS" prefix, compare without the prefix
      const cleanTitleA = titleA.substring(4);
      const cleanTitleB = titleB.substring(4);
      return cleanTitleA.localeCompare(cleanTitleB);
    }

    const suffixIndexA = specialSuffixes.findIndex((suffix) =>
      titleA.endsWith(suffix)
    );
    const suffixIndexB = specialSuffixes.findIndex((suffix) =>
      titleB.endsWith(suffix)
    );

    if (suffixIndexA !== -1) {
      if (suffixIndexB !== -1) {
        return titleA.localeCompare(titleB);
      } else {
        return 1; // Special suffix comes after other titles
      }
    } else if (suffixIndexB !== -1) {
      return -1; // Other titles come before special suffix
    } else {
      return titleA.localeCompare(titleB);
    }
  });

  return filteredSongdbs;
}

function getGlobalPlayedSong() {
  try {
    const obj = Object.entries(mostPlayed[`${getWeekNumber()}`])
      .sort((a, b) => b[1] - a[1])
      .map((item) => item[0]);
    return obj;
  } catch (err) {
    return [];
  }
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.slice(0, 24);
}
function processPlaylists(playlists) {
  playlists.forEach((playlist) => {
    var playlistName = playlist.name;
    var songList = playlist.songlist;
    if (!playlistName.startsWith("DFRecommendedFU"))
      addCategories(
        generateCategories(`[icon:PLAYLIST] ${playlistName}`, songList)
      );
  });
}
function generateWeeklyRecommendedSong(playlists) {
  playlists.forEach((playlist) => {
    var playlistName = playlist.name;
    var songList = playlist.songlist;
    var RecommendedName = playlist.RecommendedName || "";
    if (playlistName == `DFRecommendedFU${getWeekNumber()}`)
      addCategories(
        generateCategories(
          `[icon:PLAYLIST] Weekly: ${RecommendedName}`,
          songList
        )
      );
  });
}
function getWeekNumber() {
  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), 0, 1);
  const daysSinceStartOfWeek = Math.floor(
    (now - startOfWeek) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((daysSinceStartOfWeek + 1) / 7);
  return weekNumber;
}
function addJDVersion(songdbs, excludeSongs) {
  addCategories(
    generateCategories(
      "Just Dance 2024 Edition",
      filterSongsByJDVersion(songdbs, 2024).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 2023 Edition",
      filterSongsByJDVersion(songdbs, 2023).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 2022",
      filterSongsByJDVersion(songdbs, 2022).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 2021",
      filterSongsByJDVersion(songdbs, 2021).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 2020",
      filterSongsByJDVersion(songdbs, 2020).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 2019",
      filterSongsByJDVersion(songdbs, 2019).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 2018",
      filterSongsByJDVersion(songdbs, 2018).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 2017",
      filterSongsByJDVersion(songdbs, 2017).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 2016",
      filterSongsByJDVersion(songdbs, 2016).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 2015",
      filterSongsByJDVersion(songdbs, 2015).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 2014",
      filterSongsByJDVersion(songdbs, 2014).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 4",
      filterSongsByJDVersion(songdbs, 4).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 3",
      filterSongsByJDVersion(songdbs, 3).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 2",
      filterSongsByJDVersion(songdbs, 2).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance 1",
      filterSongsByJDVersion(songdbs, 1).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "Just Dance Kids",
      filterSongsByJDVersion(songdbs, 123).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
  addCategories(
    generateCategories(
      "ABBA: You Can Dance",
      filterSongsByJDVersion(songdbs, 4884).filter(
        (song) => !excludeSongs.includes(song)
      )
    )
  );
}

function generateCoopCarousel() {
  return generateRivalCarousel();
}

function generateRivalCarousel() {
  carousel = {};
  carousel = CloneObject(cClass.rootClass);
  carousel.actionLists = cClass.actionListsClass;
  var songdbs = Object.keys(songdb);
  var songfbs2 = CloneObject(songdbs);

  // Sort the "Just Dance Next" category alphabetically
  songfbs2.sort((a, b) => {
    const titleA = (songdb[a].title + songdb[a].mapName).toLowerCase();
    const titleB = (songdb[b].title + songdb[b].mapName).toLowerCase();
    return titleA.localeCompare(titleB);
  });

  const songs2023 = filterSongsByJDVersion(songdbs, 2023); // Ensure 2023 is the correct JD version

  // Log a specific song from the filtered list to check its details
  // Home Section
  const recommendedSongs = CloneObject(shuffleArray(songdbs));
  const originalJD2017Songs = filterSongsByJDVersion(songdbs, 2017);
  const randomOriginalJD2017Song =
    originalJD2017Songs[Math.floor(Math.random() * originalJD2017Songs.length)];

  // Ensure at least one song from 2017 is in the recommended category
  recommendedSongs[0] = randomOriginalJD2017Song;

  addCategories(generateCategories("Recommended For You", recommendedSongs));

  const playlists = readDatabaseJson("carousel/playlists.json");
  if (playlists && playlists.length > 0) {
    const playlistSongs = playlists.flatMap((playlist) => playlist.songlist);

    // Sort playlistSongs alphabetically by title
    playlistSongs.sort((a, b) => {
      const titleA = ((songdb[a] && songdb[a].title) || "").toLowerCase();
      const titleB = ((songdb[b] && songdb[b].title) || "").toLowerCase();
      return titleA.localeCompare(titleB);
    });

    // Exclude playlist songs from the JD Version rows
    const jdVersionSongs = songdbs.filter(
      (song) => !playlistSongs.includes(song)
    );
    // Add Original JD Songs
    addJDVersion(jdVersionSongs, playlistSongs);
  }

  // Add "Just Dance Next" category to the carousel
  addCategories(generateCategories("Just Dance Next", songfbs2));

  function addCombinedPlaylists() {
    const playlists = readDatabaseJson("carousel/playlists.json");

    if (playlists && playlists.length > 0) {
      const combinedPlaylist = playlists.reduce((combined, playlist) => {
        const playlistName = playlist.name;
        const songList = playlist.songlist;

        // Sort songList alphabetically by title
        songList.sort((a, b) => {
          const titleA = ((songdb[a] && songdb[a].title) || "").toLowerCase();
          const titleB = ((songdb[b] && songdb[b].title) || "").toLowerCase();

          return titleA.localeCompare(titleB);
        });

        // Add the playlist to the combined playlist
        combined.push(generateCategories(playlistName, songList));

        return combined;
      }, []);

      // Add the combined playlist categories to the carousel
      combinedPlaylist.forEach((category) => addCategories(category));
    }
  }

  // Call addCombinedPlaylists after adding "Just Dance Next" category
  addCombinedPlaylists();

  // Playlist Section
  addCategories(Object.assign({}, cClass.searchCategoryClass));
  return carousel;
}

function generateSweatCarousel() {
  carousel = {};
  carousel = CloneObject(cClass.rootClass);
  carousel.actionLists = cClass.actionListsClass;
  var songdbs = Object.keys(songdb);
  var songfbs2 = CloneObject(songdbs);

  // Sort the "Just Dance Next" category alphabetically
  songfbs2.sort((a, b) => {
    const titleA = (songdb[a].title + songdb[a].mapName).toLowerCase();
    const titleB = (songdb[b].title + songdb[b].mapName).toLowerCase();
    return titleA.localeCompare(titleB);
  });

  const songs2023 = filterSongsByJDVersion(songdbs, 2023); // Ensure 2023 is the correct JD version

  // Log a specific song from the filtered list to check its details
  // Home Section
  const recommendedSongs = CloneObject(shuffleArray(songdbs));
  const originalJD2017Songs = filterSongsByJDVersion(songdbs, 2017);
  const randomOriginalJD2017Song =
    originalJD2017Songs[Math.floor(Math.random() * originalJD2017Songs.length)];

  // Ensure at least one song from 2017 is in the recommended category
  recommendedSongs[0] = randomOriginalJD2017Song;

  addCategories(
    generateCategories("Recommended For You", recommendedSongs, "sweatMap")
  );

  // Separate category for playlist songs
  // Separate category for playlist songs
  const playlists = readDatabaseJson("carousel/playlists.json");
  if (playlists && playlists.length > 0) {
    const playlistSongs = playlists.flatMap((playlist) => playlist.songlist);

    // Sort playlistSongs alphabetically by title
    playlistSongs.sort((a, b) => {
      const titleA = ((songdb[a] && songdb[a].title) || "").toLowerCase();
      const titleB = ((songdb[b] && songdb[b].title) || "").toLowerCase();
      return titleA.localeCompare(titleB);
    });

    addCategories(generateCategories("Unreleased", playlistSongs, "sweatMap"));

    // Exclude playlist songs from the JD Version rows
    const jdVersionSongs = songdbs.filter(
      (song) => !playlistSongs.includes(song)
    );
    // Add Original JD Songs
    addJDVersion(jdVersionSongs, playlistSongs);
  }

  generateWeeklyRecommendedSong(playlists);
  processPlaylists(playlists);
  addCategories(
    generateCategories(
      `Weekly Popular ${getWeekNumber()}`,
      getGlobalPlayedSong(),
      "sweatMap"
    )
  );
  addCategories(generateCategories("Just Dance Next", songfbs2, "sweatMap")); // Sorted "Just Dance Next" category

  // Playlist Section
  addCategories(Object.assign({}, cClass.searchCategoryClass));
  return carousel;
}
function generateCreatePlaylistCarousel() {
  carousel = {};
  carousel = CloneObject(cClass.rootClass);
  carousel.actionLists = cClass.actionListsClass;
  var songdbs = Object.keys(songdb);
  var songfbs2 = CloneObject(songdbs);

  // Sort the "Just Dance Next" category alphabetically
  songfbs2.sort((a, b) => {
    const titleA = (songdb[a].title + songdb[a].mapName).toLowerCase();
    const titleB = (songdb[b].title + songdb[b].mapName).toLowerCase();
    return titleA.localeCompare(titleB);
  });

  const songs2023 = filterSongsByJDVersion(songdbs, 2023); // Ensure 2023 is the correct JD version

  // Log a specific song from the filtered list to check its details
  // Home Section
  const recommendedSongs = CloneObject(shuffleArray(songdbs));
  const originalJD2017Songs = filterSongsByJDVersion(songdbs, 2017);
  const randomOriginalJD2017Song =
    originalJD2017Songs[Math.floor(Math.random() * originalJD2017Songs.length)];

  // Ensure at least one song from 2017 is in the recommended category
  recommendedSongs[0] = randomOriginalJD2017Song;

  addCategories(
    generateCategories(
      "Recommended For You",
      recommendedSongs,
      "create-playlist"
    )
  );

  // Separate category for playlist songs
  // Separate category for playlist songs
  const playlists = readDatabaseJson("carousel/playlists.json");
  if (playlists && playlists.length > 0) {
    const playlistSongs = playlists.flatMap((playlist) => playlist.songlist);

    // Sort playlistSongs alphabetically by title
    playlistSongs.sort((a, b) => {
      const titleA = ((songdb[a] && songdb[a].title) || "").toLowerCase();
      const titleB = ((songdb[b] && songdb[b].title) || "").toLowerCase();
      return titleA.localeCompare(titleB);
    });

    // Exclude playlist songs from the JD Version rows
    const jdVersionSongs = songdbs.filter(
      (song) => !playlistSongs.includes(song)
    );
    // Add Original JD Songs
    addJDVersion(jdVersionSongs, playlistSongs);
  }

  generateWeeklyRecommendedSong(playlists);
  processPlaylists(playlists);
  addCategories(
    generateCategories(
      `Weekly Popular ${getWeekNumber()}`,
      getGlobalPlayedSong(),
      "sweatMap"
    )
  );
  addCategories(
    generateCategories("Just Dance Next", songfbs2, "create-playlist")
  ); // Sorted "Just Dance Next" category

  // Playlist Section
  addCategories(Object.assign({}, cClass.searchCategoryClass));
  return carousel;
}
downloader.getJson = async (url, options) => {
  const response = await axios.get(url, options);
  return response.data;
}

function performSearch(searchString, CarouselDB) {
  // Your existing search logic here
  if (searchString === "" || searchString === undefined) {
    return CarouselDB; // No search string provided, return the original data
  }

  const searchResult = JSON.parse(
    JSON.stringify(
      require("../../database/Platforms/jdparty-all/songdbs.json")
    )
  );

  // Add search result to search
  let current = 0;
  searchResult.categories.forEach(function (carousel) {
    if (carousel.title == "[icon:SEARCH_FILTER] Search") {
    } else {
      current = current + 1;
    }
  });
  const obj = {
    "__class": "Category",
    "title": "[icon:SEARCH_RESULT] insert search result here",
    "items": [],
    "isc": "grp_row",
    "act": "ui_carousel",
  };
  searchResult.categories.splice(current + 1, 0, obj);

  const query = searchString.toString().toUpperCase();
  const matches = [];

  for (const song in CarouselDB) {
    const obj = CarouselDB[song];
    const title = obj.title.toString().toUpperCase();
    const artist = obj.artist.toString().toUpperCase();
    const mapname = obj.mapName.toString().toUpperCase();
    const jdversion = obj.originalJDVersion.toString();
    const jdversion2 = "JUST DANCE " + obj.originalJDVersion.toString();
    const jdversion3 = "JD" + obj.originalJDVersion.toString();

    if (
      title.includes(query) ||
      jdversion.includes(query) ||
      jdversion2.includes(query) ||
      jdversion3.includes(query) ||
      artist.includes(query) ||
      mapname.includes(query)
    ) {
      matches.push(obj.mapName.toString());
    }
  }

  return searchResult;
}

function handleSearchRoute(req, res) {
  const searchString = req.body.searchString;

  // Perform the search using the performSearch function
  const searchResult = performSearch(
    searchString,
    require("../../database/Platforms/jdparty-all/songdbs.json")
  );

  res.send(searchResult);

  // Your existing code ...
}


module.exports = {
  generateRivalCarousel,
  generateCreatePlaylistCarousel,
  generateSweatCarousel,
  generateCoopCarousel,
  updateMostPlayed,
  performSearch,
  handleSearchRoute
};
