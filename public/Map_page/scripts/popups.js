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
  //let shrtn = parts[0].replace(/\//g, '');
  //preserves 2016/2024
  let shrtn = parts[0].replace(/\/(?!\d{4})/g, '');

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
