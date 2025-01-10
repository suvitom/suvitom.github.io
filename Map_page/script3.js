//Changes icons(=markers) at different zoom levels
const changeSculptIcon = () => {
  const zoomLevel = map.getZoom();

  if (!sculptureData || sculptureData.length === 0) {
    console.warn('No sculpture data for changing markers');
    return;
  }

  sculptureData.forEach(sculpt => {
    const marker = sculpt.marker;
    const {icon, bigIcon, midSizeIcon} = setMarkerGroupAndIcon(sculpt, creatYearData);

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

map.on('zoomend', function () {
  changeSculptIcon();
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

  const createdIn = document.getElementById('createdIn');
  createdIn.textContent = fi ? 'Valmistuneet vuosina:' : 'Created in:';

  const check7 = document.getElementById('check7-text');
  check7.textContent = fi ? 'ei tietoa' : 'no info.';

  const artistLabel = document.getElementById('lablTextArtist');
  artistLabel.textContent = fi ? 'taiteilijalla' : 'by artist';

  const yearLabel = document.getElementById('lablTextYear');
  yearLabel.textContent = fi ? 'vuodella' : 'by year';

  const opcLabel = document.getElementById('opacityLabl');
  opcLabel.textContent = fi ? 'läpinäkyvyys' : 'transparency';
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
setOpacitySliderVal = () => {
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
  alert(language === 'fi' ? 'Virhe paikannuksessa.' : 'Error in finding location.');
}

function getMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position, error);
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

  clearMarkerLayers();

  while (sideBarList.firstChild) {
    sideBarList.removeChild(sideBarList.firstChild); //clears the sculpture search list
  }

  addSculptures();
  changeSculptIcon();
  addTextToThePage();
};

const clearMarkerLayers = () => {
  grpOne.clearLayers();
  grpTwo.clearLayers();
  grpThree.clearLayers();
  grpFour.clearLayers();
  grpFive.clearLayers();
  grpSix.clearLayers();
  grpSeven.clearLayers();
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
  searchInput.placeholder = artistChecked ? 'Walter Runeberg' : 'Mare mare';
});

yearCkbox.addEventListener('change', () => {
  const yearChecked = yearCkbox.checked;
  artistCkbox.disabled = yearChecked;
  artistLabl.style.color = yearChecked ? 'gray' : 'black';
  artistLabl.style.background = yearChecked ? 'white' : '';
  artistLabl.style.borderColor = yearChecked ? '#b5b5b5' : '';
  yearLabl.style.color = 'black';
  searchInput.placeholder = yearChecked ? '1972' : 'Mare mare';
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

const showOrHideMarkers = interval => {
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

document.addEventListener('DOMContentLoaded', function () {
  addSculptures();
  addTextToThePage();
  setOpacitySliderVal();
});
