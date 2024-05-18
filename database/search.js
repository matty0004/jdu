// search.js

function performSearch(searchString, CarouselDB) {
  if (searchString === "" || searchString === undefined) {
    return CarouselDB; // No search string provided, return the original data
  }

  const searchResult = JSON.parse(JSON.stringify(require("../../core/carousel/classList.json")));

  // Add search result to the search
  const current = searchResult.categories.findIndex(carousel => carousel.title !== "[icon:SEARCH_FILTER] Search");
  const obj = {
    "__class": "Category",
    "title": "[icon:SEARCH_RESULT] insert search result here",
    "items": [],
    "isc": "grp_row",
    "act": "ui_carousel"
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

module.exports = { performSearch };
