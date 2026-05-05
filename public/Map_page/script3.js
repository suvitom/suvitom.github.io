//Changes icons(=markers) at different zoom levels and when the map's theme is changed
const changeSculptIcon = view => {
  const zoomLevel = map.getZoom();

  if (!sculptureData || sculptureData.length === 0) {
    console.warn('No sculpture data for changing markers');
    return;
  }

  sculptureData.forEach(sculpt => {
    const marker = sculpt.marker;
    const {icon, bigIcon, midSizeIcon} = setMarkerGroupAndIcon(sculpt, view);

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

// checks whether the default view or the year classification view is selected for the map
const checkSelectedRadioBtn = () => {
  const selected = document.querySelector('input[name="mapradio"]:checked');
  return selected.id;
};

map.on('zoomend', function () {
  changeSculptIcon(checkSelectedRadioBtn());
});

//Adds text content to the page.
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

  // const createdIn = document.getElementById('createdIn');
  // createdIn.textContent = fi ? 'Valmistuneet vuosina:' : 'Created in:';

  const check7 = document.getElementById('check7-text');
  check7.textContent = fi ? 'ei tietoa' : 'no info.';

  const artistLabel = document.getElementById('lablTextArtist');
  artistLabel.textContent = fi ? 'taiteilijalla' : 'by artist';

  const yearLabel = document.getElementById('lablTextYear');
  yearLabel.textContent = fi ? 'vuodella' : 'by year';

  const opcLabel = document.getElementById('opacityLabl');
  opcLabel.textContent = fi ? 'läpinäkyvyys' : 'transparency';

  // const likedDialog = document.getElementById('liked').children[0];
  // likedDialog.textContent = fi
  //   ? 'Kirjaudu sisään tai rekisteröidy tallentaaksesi suosikkeja!'
  //   : 'Log in or register to save your favorites!';

  // const dialogLogin = document.querySelector('#dialogLoginLink > span');
  // dialogLogin.textContent = fi ? 'Kirjaudu / Rekisteröidy' : 'Log in / Register';

  setLoginLogoutBtn(fi);
};

const setLoginLogoutBtn = async fi => {
  const loginButton = document.getElementById('logInOrOut');

  const user = await waitForAuth();
  // console.log(JSON.stringify(user, null, 2));

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

//Opacity slider for the background map
const opacitySlider = document.getElementById('opacitySlider');

opacitySlider.addEventListener('input', () => {
  const value = opacitySlider.value;
  const decimal = parseFloat(value / 10);
  wmsLayer.setOpacity(decimal);
  localStorage.setItem('opacity', decimal);
});

//opacity: a decimal value from localStorage OR 0.9 (script1.js)
const setOpacitySliderVal = () => {
  opacitySlider.value = (opacity * 10).toString();
};

//Positioning the user
let myOwnLoc = null;

function position(pos) {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  // deletes the position marker if it exists
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

// Updates the language and reloads content to reflect the change
const changeLanguage = lang => {
  localStorage.setItem('language', lang);
  language = lang;

  grpForAllMarkers.eachLayer(g => g.clearLayers());

  while (sideBarList.firstChild) {
    sideBarList.removeChild(sideBarList.firstChild); //clears the sculpture search list
  }

  addSculptures(checkSelectedRadioBtn());
  changeSculptIcon(checkSelectedRadioBtn());
  addTextToThePage();
  updateFavSideView(currentUser);
};

//Search function
const searchInput = document.getElementById('search');
const artistCkbox = document.getElementById('artistSearch');
const yearCkbox = document.getElementById('yearSearch');
const artistLabl = document.getElementById('artistLabel');
const yearLabl = document.getElementById('yearLabel');

const handleInputText = () => {
  const filter = searchInput.value.toLowerCase();
  const allListedDivs = sideBarList.getElementsByTagName('div');

  Array.from(allListedDivs).forEach(div => {
    const text = getSearchText(div).toLowerCase();
    //shows the div element if text contains filter, and hides it otherwise
    div.style.display = text.includes(filter) ? '' : 'none';
  });
};

// Search function
// Text to filter is retrieved from the div element's data based on the selected checkbox option.
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

//When the year range checkbox is checked or unchecked the marker group is added to
//or removed from the group displayed on the map.
const addOrRemoveLayer = (markerGroup, tagId) => {
  const checkbox = document.getElementById(tagId);
  if (checkbox.checked) {
    grpForAllMarkers.addLayer(markerGroup);
  } else {
    grpForAllMarkers.removeLayer(markerGroup);
  }
};

const showOrHideMarkers1 = interval => {
  switch (interval) {
    case '–1825':
      addOrRemoveLayer(grpOne, 'check1');
      break;
    case '1826–1865':
      addOrRemoveLayer(grpTwo, 'check2');
      break;
    case '1866–1905':
      addOrRemoveLayer(grpThree, 'check3');
      break;
    case '1906–1945':
      addOrRemoveLayer(grpFour, 'check4');
      break;
    case '1946–1985':
      addOrRemoveLayer(grpFive, 'check5');
      break;
    case '1986–2025':
      addOrRemoveLayer(grpSix, 'check6');
      break;
    default:
      addOrRemoveLayer(grpSeven, 'check7');
  }
};

const showOrHideMarkers2 = selection => {
  addOrRemoveLayer(grpEight, 'check2_def');
};

document.addEventListener('DOMContentLoaded', function () {
  const {auth, db} = initializeFirebase();

  auth.onAuthStateChanged(user => {
    updateFavSideView(user);
    currentUser = user;
  });

  addSculptures('def_radio');
  addTextToThePage();
  setOpacitySliderVal();
});
