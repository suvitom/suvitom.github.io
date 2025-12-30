// Fetches sculptures and adding them to both the map and the search list
const addSculptures = async () => {
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

  const sortedSculptures = sortSculptAlphabetically(sculptures);

  sortedSculptures.forEach(sculpt => {
    addMarkerToMap(sculpt);
    addToSidebarList(sculpt);
  });

  changeSculptIcon(); //Changes icons for the correct zoom level.
};

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
const findAndSaveCreationYear = sculptures => {
  let creationYearMap = new Map();

  sculptures.forEach(sculpt => {
    const foundSculpt = compareDataAndFindSculpt(sculpt);
    let year = foundSculpt?.year;

    if (!year) {
      const caption = [
        sculpt.picture_caption_fi,
        sculpt.picture_caption_sv,
        sculpt.picture_caption_en,
      ].join('');

      year = caption.match(/\d{4}\./)
        ? caption.match(/\d{4}\./)[0].replace('.', '')
        : caption.match(/\d{4}/)
        ? caption.match(/\d{4}/)[0]
        : null;
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

const sortSculptAlphabetically = sculptures => {
  return sculptures.sort((a, b) => {
    const nimiA = language === 'fi' ? a.name_fi : a.name_en?.replace(/^[^/]*\/\s*/, '') || '';
    const nimiB = language === 'fi' ? b.name_fi : b.name_en?.replace(/^[^/]*\/\s*/, '') || '';
    return nimiA.localeCompare(nimiB);
  });
};

const addMarkerToMap = sculpt => {
  const latitude = parseFloat(sculpt.latitude);
  const longitude = parseFloat(sculpt.longitude);

  if (!isNaN(latitude) && !isNaN(longitude)) {
    const {icon, group} = setMarkerGroupAndIcon(sculpt);
    const popupContent = createPopUp(sculpt);

    sculpt.marker = L.marker([latitude, longitude], {icon: icon}).bindPopup(popupContent).addTo(group);
  }
};

// Groupes sculptures by their creation years to enable visibility control
// and assigns icons for styling
const setMarkerGroupAndIcon = sculpt => {
  let group = null;
  let icon = null;
  let bigIcon = null;
  let midSizeIcon = null;

  if (creatYearData.has(sculpt.id)) {
    const value = parseInt(creatYearData.get(sculpt.id)) || 1;

    switch (true) {
      case value > 1985:
        group = grpSix;
        // Different sized icons for various zoom levels
        icon = iconSix;
        bigIcon = bigIconSix;
        midSizeIcon = midSizeIconSix;
        break;
      case value > 1945:
        group = grpFive;
        icon = iconFive;
        bigIcon = bigIconFive;
        midSizeIcon = midSizeIconFive;
        break;
      case value > 1905:
        group = grpFour;
        icon = iconFour;
        bigIcon = bigIconFour;
        midSizeIcon = midSizeIconFour;
        break;
      case value > 1865:
        group = grpThree;
        icon = iconThree;
        bigIcon = bigIconThree;
        midSizeIcon = midSizeIconThree;
        break;
      case value > 1825:
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
  const caption = document.createElement('div');
  caption.textContent = shortened;

  popupContent.appendChild(title);
  popupContent.appendChild(caption);
  popupContent.appendChild(link);

  return popupContent;
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
const addToSidebarList = sculpt => {
  const div = document.createElement('div');
  //Finnish name in name_en attribute is deleted
  div.textContent = language === 'fi' ? sculpt.name_fi : sculpt.name_en.replace(/^[^/]*\/\s*/, '') || '';

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
