// ===== GENERAL VARIABLES AND MAP INITIALIZATION =====
let language = localStorage.getItem('language') || 'fi';
let sculptureData = null;
let creatYearData = null;
const sideBarList = document.getElementById('list');
let currentUser = null;
let db = null;
let favIds = new Set();

const sortingSelection = document.getElementById('organize');
const searchInput = document.getElementById('search');
const artistCkbox = document.getElementById('artistSearch');
const yearCkbox = document.getElementById('yearSearch');
const artistLabl = document.getElementById('artistLabel');
const yearLabl = document.getElementById('yearLabel');

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
