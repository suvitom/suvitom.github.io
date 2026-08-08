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

// ===== SEARCH =====
// Filter the visible sidebar items based on the current search input.
const handleInputText = () => {
  // Hide items that do not match the current search text.
  const filter = searchInput.value.toLowerCase();
  const allListedDivs = sideBarList.getElementsByTagName('div');

  Array.from(allListedDivs).forEach(div => {
    const text = getSearchText(div)?.toLowerCase();
    div.style.display = text.includes(filter) ? '' : 'none';
  });
};

const getSearchText = div => {
  let text = '';

  if (artistCkbox.checked) {
    text = div.getAttribute('artist') || '';
  } else if (yearCkbox.checked) {
    text = div.getAttribute('year') || '';
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

// ===== SIDEBAR CONTENT =====
// Build the sidebar entries for the sculpture list.
const createSidebarEntry = (sculpt, order) => {
  const div = document.createElement('div');

  // Finnish name in name_en attribute is deleted (25/7 piece is an exception)
  const englishName = sculpt.name_fi !== '25/7' ? sculpt.name_en.replace(/^[^/]*\/\s*/, '') : '25/7';

  const yearValue = Number(creatYearData.get(sculpt.id));
  const year = order === 'age' && yearValue > 0 ? ` ${yearValue}` : '';

  div.textContent = language === 'fi' ? sculpt.name_fi + year : englishName + year;

  // For later use in search function
  div.classList.add('listed');
  const artist = shortnCaptOrFindArtist(sculpt, true);
  div.setAttribute('data-id', sculpt.id);
  div.setAttribute('artist', artist);
  div.setAttribute('year', yearValue);

  return div;
};

const attachSidebarClick = (div, sculpt) => {
  const latitude = parseFloat(sculpt.latitude);
  const longitude = parseFloat(sculpt.longitude);

  if (isNaN(latitude) || isNaN(longitude)) return;

  div.onclick = () => {
    map.setView([latitude, longitude], 18);
    sculpt.marker.openPopup();
    window.scrollTo({top: 0, behavior: 'smooth'});
  };
};

const addToSidebarList = (sculpt, order) => {
  const div = createSidebarEntry(sculpt, order);
  attachSidebarClick(div, sculpt);
  sideBarList.appendChild(div);
};

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
  return [...sculpts].sort((a, b) => {
    const yearA = Number(creatYearData.get(a.id));
    const yearB = Number(creatYearData.get(b.id));

    const validA = !isNaN(yearA) && yearA > 0;
    const validB = !isNaN(yearB) && yearB > 0;

    if (!validA && !validB) return 0;
    if (!validA) return 1;
    if (!validB) return -1;

    return order === 'asc' ? yearA - yearB : yearB - yearA;
  });
};

// const sortSculpturesByAge = (sculpts, order) => {
//   const indexMap = new Map(
//     [...creatYearData.entries()] //[ [id, year], [id, year], ... ]
//       .filter(([, year]) => year && !isNaN(Number(year)))
//       //a = 1849, b = 1940 -> a - b = -91 -> a first    b - a = 91 -> b first
//       .sort((a, b) => (order === 'asc' ? Number(a[1]) - Number(b[1]) : Number(b[1]) - Number(a[1])))
//       //.map() replaces years with indexes
//       .map(([key], i) => [key, i]),
//   );
//   return [...sculpts].sort(compareByIndex(indexMap));
// };

// const compareByIndex = indexMap => (a, b) => {
//   const ai = indexMap.get(a.id);
//   const bi = indexMap.get(b.id);

//   // order doesn't change
//   if (ai === undefined && bi === undefined) return 0;
//   // positive -> b first
//   if (ai === undefined) return 1;
//   //negative -> a first
//   if (bi === undefined) return -1;
//   return ai - bi;
// };

sortingSelection.addEventListener('change', () => {
  sortSculptures(sculptureData);
});

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
