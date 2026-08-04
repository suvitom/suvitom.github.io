// ===== SCULPTURE DISPLAY ON THE MAP =====
// Toggle the visibility of marker groups based on the related checkboxes.
const addOrRemoveLayer = (markerGroup, tagId) => {
  const checkbox = document.getElementById(tagId);
  if (checkbox.checked) {
    grpForAllMarkers.addLayer(markerGroup);
  } else {
    grpForAllMarkers.removeLayer(markerGroup);
  }
};

// Load sculpture data, place markers on the map, and update their appearance.
const addSculptures = async (view, favourites) => {
  // Clear old marker groups before drawing the current selection.
  grpForAllMarkers.eachLayer(g => g.clearLayers());
  let sculptures = null;

  if (!sculptureData) {
    //Fetches data if it doesn't already exist
    sculptures = await fetchSculptures();
    if (sculptures.length === 0) {
      const div = document.createElement('div');
      div.textContent = language === 'fi' ? 'Veistoksia ei voitu hakea.' : 'Failed to fetch sculptures.';
      sideBarList.appendChild(div);
      return;
    } else {
      sculptureData = sculptures; // Sets value to global sculptureData
    }
  } else {
    sculptures = sculptureData;
  }

  if (!creatYearData) {
    findAndSaveCreationYear(sculptures); //Creates a map collection if it doesn't exist.
  }

  const sortedSculptures = sortSculptures(sculptures);

  sortedSculptures.forEach(sculpt => {
    addMarkerToMap(sculpt, view, favourites);
  });

  changeSculptIcon(view); //Changes icons for the correct zoom level.

  //console.log(sculptureData);
};

// Update the displayed markers and their size when the map view changes.
const changeSculptIcon = view => {
  // Update marker size depending on the current zoom level.
  const zoomLevel = map.getZoom();

  if (!sculptureData || sculptureData.length === 0) {
    console.warn('No sculpture data for changing markers');
    return;
  }

  sculptureData.forEach(sculpt => {
    const marker = sculpt.marker;
    const {icon, bigIcon, midSizeIcon} = setMarkerGroupAndIcon(sculpt, view, favIds);

    if (marker && bigIcon) {
      if (zoomLevel <= 13) {
        marker.setIcon(icon);
      } else if (zoomLevel > 13 && zoomLevel < 16) {
        marker.setIcon(midSizeIcon);
      } else {
        marker.setIcon(bigIcon);
      }
    }
  });
};

// Check which map view radio button is currently selected.
const checkSelectedRadioBtn = () => {
  const selected = document.querySelector('input[name="mapradio"]:checked');
  return selected.id;
};

map.on('zoomend', function () {
  changeSculptIcon(checkSelectedRadioBtn());
});

// ===== SCULPTURE ORGANIZING =====
// Sort sculptures and build the sidebar list from the selected order.
const sortSculptures = sculpts => {
  // Reset the sidebar before rebuilding it from the sorted list.
  sideBarList.replaceChildren();

  const sortingValue = sortingSelection.value;
  let sortedSculptures = [...sculpts];

  let order = '';

  if (sortingValue == '1') {
    sortedSculptures = sortSculptAlphabetically(sculpts, 'asc');
  } else if (sortingValue == '2') {
    sortedSculptures = sortSculptAlphabetically(sculpts, 'desc');
  } else if (sortingValue == '3') {
    //oldest first
    sortedSculptures = sortSculpturesByAge(sculpts, 'asc');
    order = 'age';
  } else if (sortingValue == '4') {
    //newest first
    sortedSculptures = sortSculpturesByAge(sculpts, 'desc');
    order = 'age';
  }

  sortedSculptures.forEach(sculpt => {
    addToSidebarList(sculpt, order);
  });

  return sortedSculptures;
};

const sortSculpturesByAge = (sculpts, order) => {
  const indexMap = new Map(
    [...creatYearData.entries()] //[ [id, year], [id, year], ... ]
      .filter(([, year]) => year && !isNaN(Number(year)))
      //a = 1849, b = 1940 -> a - b = -91 -> a first    b - a = 91 -> b first
      .sort((a, b) => (order === 'asc' ? Number(a[1]) - Number(b[1]) : Number(b[1]) - Number(a[1])))
      //.map() replaces years with indexes
      .map(([key], i) => [key, i]),
  );
  return [...sculpts].sort(compareByIndex(indexMap));
};

const compareByIndex = indexMap => (a, b) => {
  const ai = indexMap.get(a.id);
  const bi = indexMap.get(b.id);

  // order doesn't change
  if (ai === undefined && bi === undefined) return 0;
  // positive -> b first
  if (ai === undefined) return 1;
  //negative -> a first
  if (bi === undefined) return -1;
  return ai - bi;
};

sortingSelection.addEventListener('change', () => {
  sortSculptures(sculptureData);
});

// ===== SCULPTURE DATA PROCESSING =====
// Prepare and enrich sculpture data after it has been fetched.
const departmentId = '0afb1cd8-726d-4900-8a7f-5e3447e8f477';
const url = `https://www.hel.fi/palvelukarttaws/rest/v4/unit/?department=${departmentId}`;

const fetchSculptures = async () => {
  let data = null;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network request failed');
    }
    const d = await response.json();
    data = d;
  } catch (error) {
    console.error('Error in fetching sculpture data:', error);
    data = [];
  }
  return data;
};

const extractYear = caption => {
  // "1849." → "1849"
  if (caption.match(/\d{4}\./)) return caption.match(/\d{4}\./)[0].replace('.', '');

  // "1849 " → "1849"
  if (caption.match(/\d{4} /)) return caption.match(/\d{4}/)[0];

  // "1901-02" → "1902"
  if (caption.match(/\d{4}-\d{2}/)) {
    const m = caption.match(/(\d{2})\d{2}-(\d{2})/);
    return m[1] + m[2];
  }

  return null;
};

const findAndSaveCreationYear = sculptures => {
  let creationYearMap = new Map();

  sculptures.forEach(sculpt => {
    const foundSculpt = compareDataAndFindSculpt(sculpt);
    let year = foundSculpt?.year;

    if (!year) {
      const caption = [sculpt.picture_caption_fi, sculpt.picture_caption_sv, sculpt.picture_caption_en].join(
        '',
      );
      year = extractYear(caption);
    }
    creationYearMap.set(sculpt.id, year);
  });

  creatYearData = creationYearMap; // Sets value to global creatYearData

  return creationYearMap;
};

const compareDataAndFindSculpt = sculpt => {
  const slicedName = sculpt.name_fi.trim().slice(0, 3).toLowerCase();
  //addlSculptData from additionalData.js
  const foundSculpt = addlSculptData.find(
    item => item.id === sculpt.id && item.name_fi.trim().toLowerCase().startsWith(slicedName),
  );
  return foundSculpt;
};

const sortSculptAlphabetically = (sculptures, order) => {
  return sculptures.sort((a, b) => {
    const enNameA = a.name_en?.replace(/^[^/]*\/\s*/, '');
    const enNameB = b.name_en?.replace(/^[^/]*\/\s*/, '');

    const nimiA = language === 'fi' ? a.name_fi : enNameA || '';
    const nimiB = language === 'fi' ? b.name_fi : enNameB || '';

    return order === 'desc'
      ? nimiB.localeCompare(nimiA) // Z → A
      : nimiA.localeCompare(nimiB); // A → Z
  });
};
