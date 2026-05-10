// Fetches sculptures and adds them to both the map and the search list
const addSculptures = async (view, favourites) => {
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
};

const sortingSelection = document.getElementById('organize');

// Sorts the sculptures based on the dropdown selection. Adds them to the sidebarlist.
const sortSculptures = sculpts => {
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

// Sorts the objects in the sculpture array by their creation year, either from
// oldest to newest (asc) or from newest to oldest (desc), using the
// creatYearData map as a reference.
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

// Creates a map collection for the creation years of the sculptures
// First, checks if the sculpture exists in the additional data with the year information,
// and then searches for the year in the caption.
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

// Searches for sculptures with the same ID in the additional data and the city's data,
// and as a precaution, checks that the names start with the same letters.
const compareDataAndFindSculpt = sculpt => {
  const slicedName = sculpt.name_fi.trim().slice(0, 3).toLowerCase();
  const foundSculpt = addlSculptData.find(
    item => item.id === sculpt.id && item.name_fi.trim().toLowerCase().startsWith(slicedName),
  );
  return foundSculpt;
};

const sortSculptAlphabetically = (sculptures, order) => {
  return sculptures.sort((a, b) => {
    const nimiA = language === 'fi' ? a.name_fi : a.name_en?.replace(/^[^/]*\/\s*/, '') || '';
    const nimiB = language === 'fi' ? b.name_fi : b.name_en?.replace(/^[^/]*\/\s*/, '') || '';
    return order === 'desc'
      ? nimiB.localeCompare(nimiA) // Z → A
      : nimiA.localeCompare(nimiB); // A → Z
  });
};

const addMarkerToMap = (sculpt, view, favouriteIds) => {
  const latitude = parseFloat(sculpt.latitude);
  const longitude = parseFloat(sculpt.longitude);

  if (!isNaN(latitude) && !isNaN(longitude)) {
    const {icon, group} = setMarkerGroupAndIcon(sculpt, view, favouriteIds);
    const popupContent = createPopUp(sculpt);

    sculpt.marker = L.marker([latitude, longitude], {icon: icon}).bindPopup(popupContent).addTo(group);
  }
};

// Groupes sculptures by their creation years to enable visibility control
// and assigns icons for styling
const setMarkerGroupAndIcon = (sculpt, view, favouriteIds) => {
  let group = null;
  let icon = null;
  let bigIcon = null;
  let midSizeIcon = null;

  if (creatYearData.has(sculpt.id)) {
    if (view == 'cti_radio') {
      const value = parseInt(creatYearData.get(sculpt.id)) || 1;

      switch (true) {
        case value > 1986:
          group = grpSix;
          // different sized icons for various zoom levels
          icon = iconSix;
          bigIcon = bigIconSix;
          midSizeIcon = midSizeIconSix;
          break;
        case value > 1946:
          group = grpFive;
          icon = iconFive;
          bigIcon = bigIconFive;
          midSizeIcon = midSizeIconFive;
          break;
        case value > 1906:
          group = grpFour;
          icon = iconFour;
          bigIcon = bigIconFour;
          midSizeIcon = midSizeIconFour;
          break;
        case value > 1866:
          group = grpThree;
          icon = iconThree;
          bigIcon = bigIconThree;
          midSizeIcon = midSizeIconThree;
          break;
        case value > 1826:
          group = grpTwo;
          icon = iconTwo;
          bigIcon = bigIconTwo;
          midSizeIcon = midSizeIconTwo;
          break;
        case value > 10:
          group = grpOne;
          icon = iconOne;
          bigIcon = bigIconOne;
          midSizeIcon = midSizeIconOne;
          break;
        default:
          group = grpSeven;
          icon = iconSeven;
          bigIcon = bigIconSeven;
          midSizeIcon = midSizeIconSeven;
      }
    } else {
      if (favouriteIds && favouriteIds.has(String(sculpt.id))) {
        group = grpNine;
        icon = iconNine;
        bigIcon = bigIconNine;
        midSizeIcon = midSizeIconNine;
      } else {
        group = grpEight;
        icon = iconEight;
        bigIcon = bigIconEight;
        midSizeIcon = midSizeIconEight;
      }
    }
  } else {
    console.log(`Key ${sculpt.id} not found when determining markergroup`);
  }

  return {icon, group, bigIcon, midSizeIcon};
};

// Creates markers for sculptures on the map
const createPopUp = sculpt => {
  const shortened = shortnCaptOrFindArtist(sculpt, false);

  const link = document.createElement('div');
  link.textContent = language === 'fi' ? 'Lisää...' : 'More...';
  link.classList.add('popupLink');
  link.onclick = () => goToDetailPage(sculpt);

  const popupContent = document.createElement('div');
  const title = document.createElement('b');
  title.textContent = language === 'fi' ? sculpt.name_fi : sculpt.name_en || '';
  title.classList.add('popupTitle');
  const caption = document.createElement('div');
  caption.textContent = shortened;

  const heartIcon = document.createElement('i');
  heartIcon.classList.add('fa-solid', 'fa-heart');
  heartIcon.classList.add('heartIcon');
  heartIcon.onclick = () => saveOrRemoveSculpt(sculpt, heartIcon);

  popupContent.appendChild(title);
  popupContent.appendChild(heartIcon);
  popupContent.appendChild(caption);
  popupContent.appendChild(link);

  return popupContent;
};

let currentMarker = null;

map.on('popupopen', e => {
  currentMarker = e.popup._source;
});

map.on('popupclose', e => {
  currentMarker = null;
});

const saveOrRemoveSculpt = async (sculpt, heartIcon) => {
  const marker = currentMarker;
  try {
    if (currentUser) {
      const docRef = db
        .collection('users')
        .doc(String(currentUser.uid))
        .collection('favourites')
        .doc(String(sculpt.id));
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        await docRef.delete();
        console.log('deleted:', sculpt.id);
        heartIcon.style.color = '#b1b1b1';
        if (marker) {
          // removes the sculpture from the Set that stores IDs for quick access
          favIds.delete(String(sculpt.id));
          // adds the marker to the correct group and class
          grpNine.removeLayer(marker);
          marker.addTo(grpEight);
          marker.getElement().classList.add('iconEight');
          marker.getElement().classList.remove('iconNine');
        }
      } else {
        await docRef.set({createdAt: firebase.firestore.FieldValue.serverTimestamp()});
        console.log('saved:', sculpt.id);
        heartIcon.style.color = '#693dcf';
        if (marker) {
          favIds.add(String(sculpt.id));
          grpEight.removeLayer(marker);
          marker.addTo(grpNine);
          marker.getElement().classList.add('iconNine');
          marker.getElement().classList.remove('iconEight');
        }
      }
    }
  } catch (error) {
    console.error('Error saving or deleting sculpture as a favorite:', error);
  }
};

const shortnCaptOrFindArtist = (sculpt, artist) => {
  let shortened = '';

  if (language === 'fi') {
    let capt_fi = sculpt.picture_caption_fi ? sculpt.picture_caption_fi : '';
    shortened = artist ? findArtist(capt_fi, sculpt) : setShortenedCapt(capt_fi, sculpt);
  }

  if (language === 'en') {
    let capt_en = sculpt.picture_caption_en ? sculpt.picture_caption_en : '';
    shortened = artist ? findArtist(capt_en, sculpt) : setShortenedCapt(capt_en, sculpt);
  }

  return shortened;
};

// The caption is shortened for the marker popup.
// If suitable text (containing info about the artist etc.) is not found in the caption,
// the text for the popup is attempted to be generated from the additional data.
const setShortenedCapt = (capt, sculpt) => {
  const parts = capt.split(/©|Kuva|Photo/);
  shrtn = parts[0].replace(/\//g, '');

  shrtn = shrtn
    .replace('Et voi käyttää kuvaa kaupallisiin tarkoituksiin.', '')
    .replace('You may not use this photo for commercial purposes.', '');

  if (shrtn.length > 92) {
    shrtn = shrtn.substring(0, 92) + '...';
  }

  if (!shrtn) {
    const sculpture = compareDataAndFindSculpt(sculpt);
    const artist = sculpture?.artist || '';
    const year = sculpture?.year || '';
    shrtn = year || artist ? `${artist} ${year}.` : '';
  }
  return shrtn;
};

//The artist is attempted to be searched first from the additional data and then from the caption.
const findArtist = (capt, sculpt) => {
  let artist = null;
  const foundSculpt = compareDataAndFindSculpt(sculpt);
  artist = foundSculpt?.artist || null;

  if (!artist) {
    let firstColonIndex = capt.indexOf(':');
    artist = firstColonIndex !== -1 ? capt.substring(0, firstColonIndex) : '';
  }
  return artist;
};

const goToDetailPage = sculpt => {
  const finnish = language === 'fi';
  localStorage.setItem('caption', finnish ? sculpt.picture_caption_fi : sculpt.picture_caption_en);
  localStorage.setItem('description', finnish ? sculpt.desc_fi : sculpt.desc_en);
  localStorage.setItem('name', finnish ? sculpt.name_fi : sculpt.name_en);
  localStorage.setItem('url', sculpt.picture_url);
  window.location.href = '../Detailpage/Detailpage.html';
};

// Creating the content for the search list.
const addToSidebarList = (sculpt, order) => {
  const div = document.createElement('div');
  //Finnish name in name_en attribute is deleted
  const englishName = sculpt.name_en.replace(/^[^/]*\/\s*/, '');

  const yearValue = Number(creatYearData.get(sculpt.id));
  const year = order == 'age' && yearValue > 0 ? ` ${yearValue}` : '';

  div.textContent = language === 'fi' ? sculpt.name_fi + year : englishName + year || '';

  div.classList.add('listed');
  const artist = shortnCaptOrFindArtist(sculpt, true);
  div.setAttribute('data-id', sculpt.id);
  div.setAttribute('artist', artist);

  const latitude = parseFloat(sculpt.latitude);
  const longitude = parseFloat(sculpt.longitude);

  if (!isNaN(latitude) && !isNaN(longitude)) {
    div.onclick = () => {
      map.setView([latitude, longitude], 18);
      sculpt.marker.openPopup();
      window.scrollTo({top: 0, behavior: 'smooth'});
    };
  }
  sideBarList.appendChild(div);
};
