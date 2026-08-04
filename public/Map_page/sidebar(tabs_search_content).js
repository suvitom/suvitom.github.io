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
    const idAttr = div.getAttribute('data-id');
    const numericId = Number(idAttr);
    if (creatYearData.has(numericId)) {
      text = String(creatYearData.get(numericId)) || '';
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

// ===== SIDEBAR CONTENT =====
// Build the sidebar entries for the sculpture list.
const addToSidebarList = (sculpt, order) => {
  const div = document.createElement('div');
  //Finnish name in name_en attribute is deleted (25/7 piece is exception)
  const englishName = sculpt.name_fi != '25/7' ? sculpt.name_en.replace(/^[^/]*\/\s*/, '') : '25/7';

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
