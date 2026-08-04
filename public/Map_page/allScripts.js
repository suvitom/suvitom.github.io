// ===== GENERAL VARIABLES AND MAP INITIALIZATION =====
let language = localStorage.getItem('language') || 'fi';
let sculptureData = null;
let creatYearData = null;
const sideBarList = document.getElementById('list');
let currentUser = null;
let db = null;
let favIds = new Set();

// Basic map settings and the base map layer.
let lat = 60.172;
let lon = 24.95;
const opacity = parseFloat(localStorage.getItem('opacity')) || 0.9;
let map = L.map('map', {maxZoom: 20, minZoom: 11}).setView([lat, lon], 13);

const wmsLayer = L.tileLayer
  .wms('https://kartta.hel.fi/ws/geoserver/avoindata/wms', {
    layers: 'avoindata:Karttasarja_harmaa',
    format: 'image/png',
    version: '1.3.0',
    maxZoom: 20,
    attribution: 'Helsingin kaupunki',
    opacity: opacity,
  })
  .addTo(map);

// ===== MARKER STYLES AND GROUPS =====
// Define marker sizes and icon variants for different zoom levels and map views.
const size = [7, 7];
const midSize = [10, 10];
const bigSize = [14, 14];

const iconOne = L.divIcon({className: 'iconOne', iconSize: size});
const iconTwo = L.divIcon({className: 'iconTwo', iconSize: size});
const iconThree = L.divIcon({className: 'iconThree', iconSize: size});
const iconFour = L.divIcon({className: 'iconFour', iconSize: size});
const iconFive = L.divIcon({className: 'iconFive', iconSize: size});
const iconSix = L.divIcon({className: 'iconSix', iconSize: size});
const iconSeven = L.divIcon({className: 'iconSeven', iconSize: size});
const iconEight = L.divIcon({className: 'iconEight', iconSize: size});
const iconNine = L.divIcon({className: 'iconNine', iconSize: size});

const midSizeIconOne = L.divIcon({className: 'iconOne', iconSize: midSize});
const midSizeIconTwo = L.divIcon({className: 'iconTwo', iconSize: midSize});
const midSizeIconThree = L.divIcon({className: 'iconThree', iconSize: midSize});
const midSizeIconFour = L.divIcon({className: 'iconFour', iconSize: midSize});
const midSizeIconFive = L.divIcon({className: 'iconFive', iconSize: midSize});
const midSizeIconSix = L.divIcon({className: 'iconSix', iconSize: midSize});
const midSizeIconSeven = L.divIcon({className: 'iconSeven', iconSize: midSize});
const midSizeIconEight = L.divIcon({className: 'iconEight', iconSize: midSize});
const midSizeIconNine = L.divIcon({className: 'iconNine', iconSize: midSize});

const bigIconOne = L.divIcon({className: 'iconOne', iconSize: bigSize});
const bigIconTwo = L.divIcon({className: 'iconTwo', iconSize: bigSize});
const bigIconThree = L.divIcon({className: 'iconThree', iconSize: bigSize});
const bigIconFour = L.divIcon({className: 'iconFour', iconSize: bigSize});
const bigIconFive = L.divIcon({className: 'iconFive', iconSize: bigSize});
const bigIconSix = L.divIcon({className: 'iconSix', iconSize: bigSize});
const bigIconSeven = L.divIcon({className: 'iconSeven', iconSize: bigSize});
const bigIconEight = L.divIcon({className: 'iconEight', iconSize: bigSize});
const bigIconNine = L.divIcon({className: 'iconNine', iconSize: bigSize});

let grpForAllMarkers = L.featureGroup().addTo(map);
let grpOne = L.featureGroup();
let grpTwo = L.featureGroup();
let grpThree = L.featureGroup();
let grpFour = L.featureGroup();
let grpFive = L.featureGroup();
let grpSix = L.featureGroup();
let grpSeven = L.featureGroup();
let grpEight = L.featureGroup();
let grpNine = L.featureGroup();

grpForAllMarkers.addLayer(grpOne);
grpForAllMarkers.addLayer(grpTwo);
grpForAllMarkers.addLayer(grpThree);
grpForAllMarkers.addLayer(grpFour);
grpForAllMarkers.addLayer(grpFive);
grpForAllMarkers.addLayer(grpSix);
grpForAllMarkers.addLayer(grpSeven);
grpForAllMarkers.addLayer(grpEight);
grpForAllMarkers.addLayer(grpNine);

const sortingSelection = document.getElementById('organize');
const searchInput = document.getElementById('search');
const artistCkbox = document.getElementById('artistSearch');
const yearCkbox = document.getElementById('yearSearch');
const artistLabl = document.getElementById('artistLabel');
const yearLabl = document.getElementById('yearLabel');

// ===== SIDEBAR TABS =====
// Manage the tab state and sidebar visibility.
const state = {
  browsing: true,
  map: false,
  favourites: false,
  top: false,
};
const sideBar = document.getElementById('sideBar');

// Manage the tab state and sidebar visibility.
const changeRightHandView = key => {
  // Switch the visible panel tab and keep the selected state in sync.
  changeTabColorAndState(key);

  for (const child of sideBar.children) {
    child.style.display = 'none';
  }
  const element = document.querySelector(`#${key}Content`);

  if (element) {
    element.style.display = 'flex';
  }
};

const changeTabColorAndState = key => {
  Object.keys(state).forEach(k => {
    state[k] = k === key;

    const element = document.querySelector(`.${k}.dot`);

    if (element) {
      element.style.color = state[k] ? '#693dcf' : '#a8a8a8';
    }
  });
};

const updateFavSideView = user => {
  const fi = language == 'fi';
  const favNoShow = document.getElementById('favNoShow');
  const favShow = document.getElementById('favShow');

  if (!user) {
    favNoShow.style.display = 'block';
    favShow.style.display = 'none';
    const span = document.getElementById('here');
    span.textContent = fi ? 'tästä' : 'here';

    favNoShow.childNodes[0].textContent = fi
      ? 'Kirjaudu sisään tallentaaksesi suosikkeja '
      : 'Sign in to save your favourites ';
  } else {
    favNoShow.style.display = 'none';
    favShow.style.display = 'flex';
  }
};

// ===== TEXT TO THE PAGE =====
// Update the visible text on the page based on the selected language.
const addTextToThePage = () => {
  const fi = language === 'fi';

  const h1 = document.getElementById('title');
  h1.textContent = fi ? 'Helsingin veistokset' : 'Sculptures of Helsinki';

  const button = document.getElementById('findMebtn');
  button.textContent = fi ? 'Etsi minut!' : 'Find me!';

  const arrow = document.getElementById('back');
  arrow.textContent = fi ? 'takaisin' : 'back';

  const subheading = document.getElementById('subHeading');
  subheading.textContent = fi ? 'Hae veistos' : 'Find a sculpture';

  const createdIn = document.getElementById('createdIn');
  createdIn.textContent = fi ? 'Valmistuneet vuosina:' : 'Created in:';

  const def = document.getElementById('default');
  def.textContent = fi ? 'Oletus:' : 'Default:';

  const sculptList = document.getElementById('sculptList');
  const browsingTabBtn = sculptList.children[0].children[1];
  browsingTabBtn.textContent = fi ? 'Selailu' : 'Browsing';
  const mapViewTabBtn = sculptList.children[1].children[1];
  mapViewTabBtn.textContent = fi ? 'Karttanäkymän valinta' : 'Map view selection';
  const favTabBtn = sculptList.children[2].children[1];
  favTabBtn.textContent = fi ? 'Suosikit' : 'Favourites';

  const options = document.getElementById('organize').options;
  options[0].textContent = fi ? 'Aakkosjärjestys (A➝Ö)' : 'Alphabetical (A➝Z)';
  options[1].textContent = fi ? 'Aakkosjärjestys (Ö➝A)' : 'Alphabetical (Z➝A)';
  options[2].textContent = fi ? 'Vanhin ensin' : 'Oldest first';
  options[3].textContent = fi ? 'Uusin ensin' : 'Newest first';

  const check7 = document.getElementById('check7-text');
  check7.textContent = fi ? 'ei tietoa' : 'no info.';

  const artistLabel = document.getElementById('lablTextArtist');
  artistLabel.textContent = fi ? 'taiteilijalla' : 'by artist';

  const yearLabel = document.getElementById('lablTextYear');
  yearLabel.textContent = fi ? 'vuodella' : 'by year';

  const opcLabel = document.getElementById('opacityLabl');
  opcLabel.textContent = fi ? 'läpinäkyvyys' : 'transparency';

  setLoginLogoutBtn(fi);
};

// ===== AUTHENTICATION =====
// Handle login, logout, and auth state changes.
const setLoginLogoutBtn = async fi => {
  const loginButton = document.getElementById('logInOrOut');

  const user = await waitForAuth();

  if (user) {
    loginButton.textContent = fi ? 'Kirjaudu ulos ➜]' : 'Sign Out ➜]';
    loginButton.onclick = signOut;
  } else {
    loginButton.textContent = fi ? 'Kirjaudu ☕︎' : 'Sign In ☕︎';
    loginButton.onclick = goToLoginPage;
  }
};

const signOut = async () => {
  await firebase.auth().signOut();
  setLoginLogoutBtn(language === 'fi');
  currentUser = null;
  favIds = new Set();
};

const goToLoginPage = () => {
  window.location.href = '../Loginpage/Loginpage.html';
};

const waitForAuth = () => {
  return new Promise(resolve => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    });
  });
};

// ===== OPACITYSLIDER =====
// Control the background map opacity from the slider UI.
const opacitySlider = document.getElementById('opacitySlider');

opacitySlider.addEventListener('input', () => {
  const value = opacitySlider.value;
  const decimal = parseFloat(value / 10);
  wmsLayer.setOpacity(decimal);
  localStorage.setItem('opacity', decimal);
});

const setOpacitySliderVal = () => {
  opacitySlider.value = (opacity * 10).toString();
};

// ===== POSITIONING USER =====
// Show and update the user's current location on the map.
let myOwnLoc = null;

function position(pos) {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  if (myOwnLoc !== null) {
    map.removeLayer(myOwnLoc);
  }

  myOwnLoc = L.marker([lat, lon]).addTo(map);
  myOwnLoc.bindPopup(language === 'fi' ? 'Olet tässä!' : "You're here!").openPopup();
  map.setView([lat, lon], 18);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  const messages = {
    fi: {
      1: 'Paikannuslupa evätty. Tarkista selaimen asetukset.',
      2: 'Sijaintia ei voitu määrittää. Tarkista käyttöjärjestelmän sijaintiasetukset.',
      3: 'Paikannus aikakatkaistiin.',
    },
    en: {
      1: 'Location permission denied. Check browser settings.',
      2: "Location could not be determined. Check operating system's location settings.",
      3: 'Location request timed out.',
    },
  };
  const lang = language === 'fi' ? 'fi' : 'en';
  alert(
    messages[lang][err.code] || (language === 'fi' ? 'Virhe paikannuksessa.' : 'Error in finding location.'),
  );
}

function getMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  } else {
    alert(
      language === 'fi'
        ? 'Paikannus ei ole tuettu tässä selaimessa.'
        : 'Geolocation is not supported in this browser.',
    );
  }
}

// ===== LANGUAGE =====
// Switch the UI language and refresh the currently visible content.
const changeLanguage = lang => {
  localStorage.setItem('language', lang);
  language = lang;

  grpForAllMarkers.eachLayer(g => g.clearLayers());

  while (sideBarList.firstChild) {
    sideBarList.removeChild(sideBarList.firstChild);
  }

  addSculptures(checkSelectedRadioBtn(), favIds);
  changeSculptIcon(checkSelectedRadioBtn());
  addTextToThePage();
  updateFavSideView(currentUser);
};

// ===== SEARCH =====
// Filter the visible sidebar items based on the current search input.
const handleInputText = () => {
  // Hide items that do not match the current search text.
  const filter = searchInput.value.toLowerCase();
  const allListedDivs = sideBarList.getElementsByTagName('div');

  Array.from(allListedDivs).forEach(div => {
    const text = getSearchText(div).toLowerCase();
    div.style.display = text.includes(filter) ? '' : 'none';
  });
};

const getSearchText = div => {
  let text = '';

  if (artistCkbox.checked) {
    text = div.getAttribute('artist') || '';
  } else if (yearCkbox.checked) {
    const idAttr = div.getAttribute('data-id');
    const numericId = Number(idAttr);
    if (creatYearData.has(numericId)) {
      text = creatYearData.get(numericId) || '';
    }
  } else {
    text = div.textContent || '';
  }

  return text;
};

searchInput.addEventListener('input', handleInputText);

artistCkbox.addEventListener('change', () => {
  const artistChecked = artistCkbox.checked;
  yearCkbox.disabled = artistChecked;
  yearLabl.style.color = artistChecked ? 'gray' : 'black';
  yearLabl.style.background = artistChecked ? 'white' : '';
  yearLabl.style.borderColor = artistChecked ? '#b5b5b5' : '';
  artistLabl.style.color = 'black';
  searchInput.placeholder = artistChecked ? 'Walter Runeberg' : '';
});

yearCkbox.addEventListener('change', () => {
  const yearChecked = yearCkbox.checked;
  artistCkbox.disabled = yearChecked;
  artistLabl.style.color = yearChecked ? 'gray' : 'black';
  artistLabl.style.background = yearChecked ? 'white' : '';
  artistLabl.style.borderColor = yearChecked ? '#b5b5b5' : '';
  yearLabl.style.color = 'black';
  searchInput.placeholder = yearChecked ? '1972' : '';
});

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
  const foundSculpt = addlSculptData.find(
    item => item.id === sculpt.id && item.name_fi.trim().toLowerCase().startsWith(slicedName),
  );
  return foundSculpt;
};

// Sorts sculptures alphabetically and trims English name prefixes.
const sortSculptAlphabetically = (sculptures, order) => {
  return sculptures.sort((a, b) => {
    // if (a.name_en != || b.name_en)
    const nimiA = language === 'fi' ? a.name_fi : a.name_en?.replace(/^[^/]*\/\s*/, '') || '';
    const nimiB = language === 'fi' ? b.name_fi : b.name_en?.replace(/^[^/]*\/\s*/, '') || '';
    return order === 'desc'
      ? nimiB.localeCompare(nimiA) // Z → A
      : nimiA.localeCompare(nimiB); // A → Z
  });
};

// ===== MARKER CREATION =====
// Create a map marker for each sculpture using the selected group and popup content.
const addMarkerToMap = (sculpt, view, favouriteIds) => {
  // Convert coordinates to numbers and place the marker only when both are valid.
  const latitude = parseFloat(sculpt.latitude);
  const longitude = parseFloat(sculpt.longitude);

  if (!isNaN(latitude) && !isNaN(longitude)) {
    const {icon, group} = setMarkerGroupAndIcon(sculpt, view, favouriteIds);
    const popupContent = createPopUp(sculpt, favouriteIds);

    sculpt.marker = L.marker([latitude, longitude], {icon: icon}).bindPopup(popupContent).addTo(group);
  }
};

// ===== MARKER GROUPING AND ICON SELECTION =====
// Group sculptures by creation year for visibility control and assign the correct icon styling.
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

// ===== POPUPS =====
// Create the popup content and favorite interaction for each marker.
const createPopUp = (sculpt, favouriteIds) => {
  // Use the shortened caption for a compact popup preview.
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
  heartIcon.style.display = currentUser ? 'inline-block' : 'none';

  if (currentUser) {
    heartIcon.style.color = favouriteIds.has(String(sculpt.id)) ? '#ff4b66' : '#b1b1b1';
  } else {
    heartIcon.style.color = '#b1b1b1';
  }

  popupContent.appendChild(title);
  popupContent.appendChild(heartIcon);
  popupContent.appendChild(caption);
  popupContent.appendChild(link);

  return popupContent;
};

const getDocSnap = async sculpt => {
  const docRef = db
    .collection('users')
    .doc(String(currentUser.uid))
    .collection('favourites')
    .doc(String(sculpt.id));
  const docSnap = await docRef.get();
  return {docSnap, docRef};
};

let currentMarker = null;

map.on('popupopen', e => {
  currentMarker = e.popup._source;
});

map.on('popupclose', e => {
  currentMarker = null;
});

const saveOrRemoveSculpt = async (sculpt, heartIcon) => {
  // The currently open popup marker is used to update the correct marker instance.
  const marker = currentMarker;
  try {
    if (currentUser) {
      const {docSnap, docRef} = await getDocSnap(sculpt);
      if (docSnap.exists) {
        await docRef.delete();
        console.log('deleted:', sculpt.id);
        heartIcon.style.color = '#b1b1b1';
        if (marker) {
          // removes the sculpture from the Set that stores IDs for quick access
          favIds.delete(String(sculpt.id));
          // adds the marker to the correct group and gives it a group-specific color
          grpNine.removeLayer(marker);
          marker.addTo(grpEight);
          setTimeout(() => marker.openPopup(), 800);
          marker.getElement().style.backgroundColor = '#ffd942';
        }
      } else {
        await docRef.set({createdAt: firebase.firestore.FieldValue.serverTimestamp()});
        console.log('saved:', sculpt.id);
        heartIcon.style.color = '#ff4b66';
        if (marker) {
          favIds.add(String(sculpt.id));
          grpEight.removeLayer(marker);
          marker.addTo(grpNine);
          setTimeout(() => marker.openPopup(), 800);
          marker.getElement().style.backgroundColor = 'red';
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

const setShortenedCapt = (capt, sculpt) => {
  const parts = capt.split(/©|Kuva|Photo/);
  let shrtn = parts[0].replace(/\//g, '');

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

// ===== USER REDIRECT =====
// Send the user to the detail page when a sculpture is selected.
const goToDetailPage = sculpt => {
  const finnish = language === 'fi';
  localStorage.setItem('caption', finnish ? sculpt.picture_caption_fi : sculpt.picture_caption_en);
  localStorage.setItem('description', finnish ? sculpt.desc_fi : sculpt.desc_en);
  localStorage.setItem('name', finnish ? sculpt.name_fi : sculpt.name_en);
  localStorage.setItem('url', sculpt.picture_url);
  localStorage.setItem('sculptId', sculpt.id);
  window.location.href = '../Detailpage/Detailpage.html';
};

// ===== SIDEBAR CONTENT =====
// Build the sidebar entries for the sculpture list.
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

document.addEventListener('DOMContentLoaded', function () {
  const {auth, database} = initializeFirebase();
  db = database;

  auth.onAuthStateChanged(async user => {
    updateFavSideView(user);
    currentUser = user;

    let favouriteIds = new Set();
    if (user) {
      const snaps = await db.collection('users').doc(user.uid).collection('favourites').get();
      snaps.forEach(sculpt => favouriteIds.add(sculpt.id));
    }
    favIds = favouriteIds;
    addSculptures('def_radio', favouriteIds);
  });

  addTextToThePage();
  setOpacitySliderVal();
});
