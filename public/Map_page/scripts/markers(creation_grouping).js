// ===== MARKER CREATION =====
// Create a map marker for each sculpture using the selected group and popup content.
const addMarkerToMap = (sculpt, view, favouriteIds) => {
  // Convert coordinates to numbers and place the marker only when both are valid.
  const latitude = parseFloat(sculpt.latitude);
  const longitude = parseFloat(sculpt.longitude);

  if (!isNaN(latitude) && !isNaN(longitude)) {
    const {icon, group} = setMarkerGroupAndIcon(sculpt, view, favouriteIds);
    const popupContent = createPopUp(sculpt, favouriteIds);

    sculpt.marker = L.marker([latitude, longitude], {icon: icon}).bindPopup(popupContent).addTo(group);
  }
};

// ===== MARKER GROUPING AND ICON SELECTION =====
// Group sculptures by creation year for visibility control and assign the correct icon styling.
const setMarkerGroupAndIcon = (sculpt, view, favouriteIds) => {
  let group = null;
  let icon = null;
  let bigIcon = null;
  let midSizeIcon = null;

  if (creatYearData.has(sculpt.id)) {
    if (view == 'cti_radio') {
      const value = parseInt(creatYearData.get(sculpt.id)) || 1;

      switch (true) {
        case value > 1986:
          group = grpSix;
          // different sized icons for various zoom levels
          icon = iconSix;
          bigIcon = bigIconSix;
          midSizeIcon = midSizeIconSix;
          break;
        case value > 1946:
          group = grpFive;
          icon = iconFive;
          bigIcon = bigIconFive;
          midSizeIcon = midSizeIconFive;
          break;
        case value > 1906:
          group = grpFour;
          icon = iconFour;
          bigIcon = bigIconFour;
          midSizeIcon = midSizeIconFour;
          break;
        case value > 1866:
          group = grpThree;
          icon = iconThree;
          bigIcon = bigIconThree;
          midSizeIcon = midSizeIconThree;
          break;
        case value > 1826:
          group = grpTwo;
          icon = iconTwo;
          bigIcon = bigIconTwo;
          midSizeIcon = midSizeIconTwo;
          break;
        case value > 10:
          group = grpOne;
          icon = iconOne;
          bigIcon = bigIconOne;
          midSizeIcon = midSizeIconOne;
          break;
        default:
          group = grpSeven;
          icon = iconSeven;
          bigIcon = bigIconSeven;
          midSizeIcon = midSizeIconSeven;
      }
    } else {
      if (favouriteIds && favouriteIds.has(String(sculpt.id))) {
        group = grpNine;
        icon = iconNine;
        bigIcon = bigIconNine;
        midSizeIcon = midSizeIconNine;
      } else {
        group = grpEight;
        icon = iconEight;
        bigIcon = bigIconEight;
        midSizeIcon = midSizeIconEight;
      }
    }
  } else {
    console.log(`Key ${sculpt.id} not found when determining markergroup`);
  }

  return {icon, group, bigIcon, midSizeIcon};
};
