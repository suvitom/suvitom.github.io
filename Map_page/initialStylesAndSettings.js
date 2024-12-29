let language = localStorage.getItem('kieli') || 'fi';
let sculptureData = null; //for the zoom
let creatYearData = null; //for the zoom

//Map initial settings
let lat = 60.2;
let lon = 25.0;
let map = L.map('map', {maxZoom: 20, minZoom: 10}).setView(
  [lat, lon],
  12,
);
wmsLayer = L.tileLayer.wms("https://kartta.hel.fi/ws/geoserver/avoindata/wms", {
  layers: 'avoindata:Karttasarja_harmaa', 
  format: 'image/png',                      
  version: '1.3.0',
  maxZoom: 20,
  attribution: 'Helsingin kaupunki'        
}).addTo(map);

//Marker styles
const iconOne = L.divIcon({className: 'iconOne', iconSize: [8, 8]});
const iconTwo = L.divIcon({className: 'iconTwo', iconSize: [8, 8]});
const iconThree = L.divIcon({className: 'iconThree', iconSize: [8, 8]});
const iconFour = L.divIcon({className: 'iconFour', iconSize: [8, 8]});
const iconFive = L.divIcon({className: 'iconFive', iconSize: [8, 8]});
const iconSix = L.divIcon({className: 'iconSix', iconSize: [8, 8]});
const iconSeven = L.divIcon({className: 'iconSeven', iconSize: [8, 8]});

const bigSculptIcon = L.icon({
  iconUrl: 'patsas.png',
  iconSize: [40, 65], 
  iconAnchor: [30, 110], 
  popupAnchor: [-10, -110], 
});

const smallSculptIcon = L.icon({
  iconUrl: 'patsas.png',
  iconSize: [30, 50],
  iconAnchor: [10, 50],
  popupAnchor: [5, -50],
});

let grpForAllMarkers = L.featureGroup().addTo(map);
let grpOne = L.featureGroup();
let grpTwo = L.featureGroup();
let grpThree = L.featureGroup();
let grpFour = L.featureGroup();
let grpFive = L.featureGroup();
let grpSix = L.featureGroup();
let grpSeven = L.featureGroup();

grpForAllMarkers.addLayer(grpOne);
grpForAllMarkers.addLayer(grpTwo);
grpForAllMarkers.addLayer(grpThree);
grpForAllMarkers.addLayer(grpFour);
grpForAllMarkers.addLayer(grpFive);
grpForAllMarkers.addLayer(grpSix);
grpForAllMarkers.addLayer(grpSeven);
