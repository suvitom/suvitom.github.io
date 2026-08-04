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
