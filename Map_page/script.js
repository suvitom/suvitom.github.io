//
const findAndSaveCreationYear = (sculptures) => {
  let creationYearMap = new Map();

  sculptures.forEach(sculpt => {
    const caption = [
      sculpt.picture_caption_fi,
      sculpt.picture_caption_sv,
      sculpt.picture_caption_en,
    ]
    .join("");

    const match = caption.match(/\d{4}\./) 
      ? caption.match(/\d{4}\./)[0].replace('.', '') 
      : caption.match(/\d{4}/)
      ? caption.match(/\d{4}/)[0]
      : null; 

    creationYearMap.set(sculpt.id, match);
  });

  creatYearData = creationYearMap; //for the zoom element

  return creationYearMap;
};

//
const modifyCreationYears = (sculptID, formID) => {
  const form = document.getElementById(formID);

  if (!form) {
    console.warn(`Form with ID ${formID} not found.`);
    return;
  }

  const optionValue = form.querySelector('.yearsSelect').value;

  if (creatYearData.has(sculptID)) { 
    creatYearData.set(sculptID, optionValue); 
  }

  clearMarkerLayers();

  addSculptures(false);
};


// Fetching sculptures and adding them to the map and search list
const addSculptures = async (fetch) => {
  let sculptures = null;
  let yearOfCreatMap = null;
  const sidebarlist = document.getElementById('list');

  if(fetch === true) {
    sculptures = await fetchSculptures();
    if (sculptures.length === 0) {
      const div = document.createElement('div');
      div.textContent = language === 'fi' ? 'Veistoksia ei voitu hakea.' : 'Failed to fetch sculptures.';
      sidebarlist.appendChild(div);
      return; 
    } else {
      sculptureData = sculptures; //for the zoom function
      yearOfCreatMap = findAndSaveCreationYear(sculptures);
    }
  } else {
    sculptures = sculptureData;  //global variables give the value
    yearOfCreatMap = creatYearData;  
  }
  
  const sortedSculptures = sortSculptAlphabetically(sculptures)
  
  sortedSculptures.forEach(sculpt => {
    const shortened = shortenCaption(sculpt, language, false);
    addMarkerToMap(sculpt, shortened, yearOfCreatMap);
    addToSidebarList(sidebarlist, sculpt);
  }); 

  changeSculptIcon();
};

const sortSculptAlphabetically = (sculptures) => {
  return sculptures.sort((a, b) => {
    const nimiA = language === 'fi' ? a.name_fi : a.name_en?.replace(/^[^/]*\/\s*/, "") || '';
    const nimiB = language === 'fi' ? b.name_fi : b.name_en?.replace(/^[^/]*\/\s*/, "") || '';
    return nimiA.localeCompare(nimiB);
  });
};

const setYearDropDown = (sculpt) => {
  const formID = `yearsForm${sculpt.id}`;
  
  const dropdown = `
  </br>
  <form id=${formID}> 
    <label for="yearSelect">${language === "fi" ? "Valitse:" : "Choose:"}</label>
    <select class="yearsSelect">
      <option value="1786">1786–1825</option>
      <option value="1826">1826–1865</option>
      <option value="1866">1866–1905</option>
      <option value="1906">1906–1945</option>
      <option value="1946">1946–1985</option>
      <option value="1986">1986–2025</option>
    </select>
    <input type="submit" value="►">
  </form>
  `;

  return {dropdown, formID};
};

const setMarkerGroupAndIcon = (sculpt, yearOfCreatMap) => {
  let group = null;
  let icon = null;
  let dropdown = '';
  let formID = null;
  
  if (yearOfCreatMap.has(sculpt.id)) {
    const value = parseInt(yearOfCreatMap.get(sculpt.id)) || 1;

    switch(true) {
      case value>1985:
        group = grpSix;
        icon = iconSix;
        break;
      case value>1945:
        group = grpFive;
        icon = iconFive;
        break;
      case value>1905:
        group = grpFour;
        icon = iconFour;
        break;
      case value>1865:
        group = grpThree;
        icon = iconThree;
        break;
      case value>1825:
        group = grpTwo;
        icon = iconTwo;
        break;
      case value>1785:
        group = grpOne;
        icon = iconOne;
        break;
      default:
        group = grpSeven;
        icon = iconSeven;
        const result = setYearDropDown(sculpt);
        dropdown = result.dropdown;
        formID = result.formID;
    }  
  } else {
    console.log(`Key ${sculpt.id} not found when determining markergroup`);
  }
  
  return { icon, group, dropdown, formID }; 
};


const addMarkerToMap = (sculpt, shortened, yearOfCreatMap) => {
  const {icon, group, dropdown, formID } = setMarkerGroupAndIcon(sculpt, yearOfCreatMap);
  const latitude = parseFloat(sculpt.latitude);
  const longitude = parseFloat(sculpt.longitude);
  
  if (!isNaN(latitude) && !isNaN(longitude)) {
    const link = `</br><a href="../Detailpage/Detailpage.html?id=${sculpt.id}">Link</a>`;
    sculpt.marker = L.marker([latitude, longitude], { icon: icon })
    .bindPopup(
      '<b>' +
        (language === 'fi' ? sculpt.name_fi : sculpt.name_en || '') +
        '</b><br>' +
        shortened +
        dropdown +
        link
    )
    .addTo(group);
  } 

  if(sculpt.marker && formID) {
    sculpt.marker.on('popupopen', () => {
      const formElement = document.getElementById(formID);
      if (formElement) {
        formElement.addEventListener('submit', function (event) {
          event.preventDefault();
          modifyCreationYears(sculpt.id, formID);
        });
      } else {
        console.warn(`Form element with ID ${formID} not found.`);
      }
    });
  }
};

const addToSidebarList = (sidebarlist, sculpt) => {
  const div = document.createElement('div');
  div.textContent = language === 'fi' ? sculpt.name_fi : sculpt.name_en.replace(/^[^/]*\/\s*/, "") || '';
  
  div.classList.add('listed');
  const artist = shortenCaption(sculpt, language, true);
  div.setAttribute('data-id', sculpt.id);
  div.setAttribute('artist', artist);

  const latitude = parseFloat(sculpt.latitude);
  const longitude = parseFloat(sculpt.longitude);

  if (!isNaN(latitude) && !isNaN(longitude)) {
    div.onclick = () => {
        map.setView([latitude, longitude], 18);
        sculpt.marker.openPopup();
        window.scrollTo({ top: 0, behavior: 'smooth' });  
    }
  }
  sidebarlist.appendChild(div);
};

//Changing the marker at different zoom levels
const changeSculptIcon = () => {
  if (!sculptureData || sculptureData.length === 0 ) {
    console.warn('No sculpture data for changing markers');
    return;
  } 
  let zoomLevel = map.getZoom();

  sculptureData.forEach(sculpt => {
    const marker = sculpt.marker;
    const {icon} = setMarkerGroupAndIcon(sculpt, creatYearData)

    if (marker && icon) {
      if (zoomLevel <= 16) {
        marker.setIcon(icon);
      } else if (zoomLevel > 16 && zoomLevel < 20) {
        marker.setIcon(smallSculptIcon);
      } else {
        marker.setIcon(bigSculptIcon);
      }
    }
  });
};

map.on('zoomend', function () {
  changeSculptIcon();
});

//Positioning the user
let myOwnLoc = null;

function position(pos) {
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;

  if (myOwnLoc !== null) {
    map.removeLayer(myOwnLoc);  // deleting the position marker if it exists
  }

  myOwnLoc = L.marker([lat, lon]).addTo(map);
  myOwnLoc
    .bindPopup(language === 'fi' ? 'Olet tässä!' : "You're here!")
    .openPopup();
  map.setView([lat, lon], 18);
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  alert(
    language === 'fi' ? 'Virhe paikannuksessa.' : 'Error in finding location.',
  );
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

//Adding textcontent to the title and buttons etc.
const addTextToTitleAndButtons = () => {
  const h1 = document.getElementById('title');
  h1.textContent = language === 'fi' ? 'Helsingin veistokset' : 'Sculptures of Helsinki';

  const button = document.getElementById('btn');
  button.textContent = language === 'fi' ? 'Etsi minut!' : 'Find me!';

  const arrow = document.getElementById('back');
  arrow.textContent = language === 'fi' ? 'takaisin' : 'back';

  const subheading = document.getElementById('subHeading');
  subheading.textContent = language === 'fi' ? 'Hae veistos' : 'Find a sculpture';

  const createdIn = document.getElementById('createdIn');
  createdIn.textContent = language === 'fi' ? 'Valmistuneet vuosina:' : 'Created in:';

  const check7 = document.getElementById('check7-text');
  check7.textContent = language === 'fi' ? 'ei tietoa/ aseta ikonista' : 'no info./ set via icon';

  const artistLabel = document.getElementById('artistLabel');
  artistLabel.textContent = language === 'fi' ? 'taiteilijalla' : 'by artist';

  const yearLabel = document.getElementById('yearLabel');
  yearLabel.textContent = language === 'fi' ? 'vuodella' : 'by year';
};

//
const clearMarkerLayers = () => {
  grpOne.clearLayers();
  grpTwo.clearLayers();
  grpThree.clearLayers();
  grpFour.clearLayers();
  grpFive.clearLayers();
  grpSix.clearLayers();
  grpSeven.clearLayers();
}

//
const changeLanguage = lang => {
  localStorage.setItem('kieli', lang);
  language = lang;

  clearMarkerLayers();

  const sideBarList = document.getElementById('list'); 

  while (sideBarList.firstChild) {
    sideBarList.removeChild(sideBarList.firstChild); //clearing the sculpture search list
  }
  
  addSculptures(false);
  changeSculptIcon();
  addTextToTitleAndButtons();
};


// Search function
const searchInput = document.getElementById('search');
const list = document.getElementById('list');
const artistCkbox = document.getElementById('artistSearch');
const yearCkbox = document.getElementById('yearSearch');
const artistLabl = document.getElementById('artistLabel');
const yearLabl = document.getElementById('yearLabel');

const getSearchText = (div) => {
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
}

const handleInputText = () => {
  const filter = searchInput.value.toLowerCase(); 
  const allListedDivs = list.getElementsByTagName('div');

  Array.from(allListedDivs).forEach(div => {
    const text = getSearchText(div).toLowerCase();
    div.style.display = text.includes(filter) ? '' : 'none';
  });
}

searchInput.addEventListener('input', handleInputText);


artistCkbox.addEventListener('change', () => {
  yearCkbox.disabled = artistCkbox.checked; 
  yearLabl.style.color = artistCkbox.checked ? 'gray' : 'black';
  artistLabl.style.color = 'black';
  searchInput.placeholder = artistCkbox.checked ? 'Walter Runeberg' : 'Mare mare';
});

yearCkbox.addEventListener('change', () => {
  artistCkbox.disabled = yearCkbox.checked; 
  artistLabl.style.color = yearCkbox.checked ? 'gray' : 'black';
  yearLabl.style.color = 'black';
  searchInput.placeholder = yearCkbox.checked ? '1972' : 'Mare mare';
});

//
const addOrRemoveLayer = (markerGroup, tagId) => {
  const checkbox = document.getElementById(tagId);
  if (checkbox.checked) {
    grpForAllMarkers.addLayer(markerGroup);
  } else {
    grpForAllMarkers.removeLayer(markerGroup);
  }
}

const showOrHideMarkers = (interval) => {
  switch(interval) {
    case '1786–1825':
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
}

document.addEventListener('DOMContentLoaded', function () {
  addSculptures(true);
  addTextToTitleAndButtons();
});
