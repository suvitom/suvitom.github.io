// ===== TEXT TO THE PAGE =====
// Update the text on the page based on the selected language.
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
