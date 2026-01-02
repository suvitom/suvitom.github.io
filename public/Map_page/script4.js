// On-click event for the marker selection dialog changes the markers on the map and
// the selection dialog to reflect either building year or favourite statues.
// User must be logged in to view or save favourite statues.
const createdInDialog = document.getElementById('createdInContent');
const likedDialog = document.getElementById('likedContent');
const likedTabButton = document.getElementById('likedTabButton');
const createdInTabButton = document.getElementById('createdInTabButton');
const hammer = document.getElementsByClassName('fa-hammer')[0];
const heart = document.getElementsByClassName('fa-heart')[0];
const heartLine = document.getElementById('heartLine');
const hammerLine = document.getElementById('hammerLine');

// On-click event changeMarkers
const changeMarkers = changeTo => {
  console.log(changeTo);

  changeDialogStyling(changeTo);
};

// Marker selection dialog styling
const changeDialogStyling = changeTo => {
  if (changeTo == 'Liked') {
    createdInDialog.style.display = 'none';
    likedDialog.style.display = 'block';
    likedTabButton.style.backgroundColor = 'white';
    createdInTabButton.style.backgroundColor = '#e2e2e2';
    heart.style.color = 'olive';
    hammer.style.color = '#959595';
    hammerLine.style.backgroundColor = '#c1c1c1';
    heartLine.style.backgroundColor = 'white';
    likedTabButton.style.cursor = 'default';
    createdInTabButton.addEventListener('mouseenter', onMouseEnterHammer);
    createdInTabButton.addEventListener('mouseleave', onMouseLeaveHammer);
    likedTabButton.removeEventListener('mouseenter', onMouseEnterHeart);
    likedTabButton.removeEventListener('mouseleave', onMouseLeaveHeart);
  } else {
    createdInDialog.style.display = 'block';
    likedDialog.style.display = 'none';
    createdInTabButton.style.backgroundColor = 'white';
    likedTabButton.style.backgroundColor = '#e2e2e2';
    hammer.style.color = 'olive';
    heart.style.color = '#959595';
    heartLine.style.backgroundColor = '#c1c1c1';
    hammerLine.style.backgroundColor = 'white';
    createdInTabButton.style.cursor = 'default';
    likedTabButton.addEventListener('mouseenter', onMouseEnterHeart);
    likedTabButton.addEventListener('mouseleave', onMouseLeaveHeart);
    createdInTabButton.removeEventListener('mouseenter', onMouseEnterHammer);
    createdInTabButton.removeEventListener('mouseleave', onMouseLeaveHammer);
  }
};

const onMouseEnterHammer = () => {
  createdInTabButton.style.backgroundColor = 'rgb(240, 240, 240)';
  createdInTabButton.style.cursor = 'pointer';
  hammer.style.color = 'darkorange';
};

const onMouseLeaveHammer = () => {
  createdInTabButton.style.backgroundColor = '#e2e2e2';
  createdInTabButton.style.cursor = 'default';
  hammer.style.color = 'olive';
};

const onMouseEnterHeart = () => {
  likedTabButton.style.backgroundColor = 'rgb(240, 240, 240)';
  likedTabButton.style.cursor = 'pointer';
  heart.style.color = 'darkorange';
};

const onMouseLeaveHeart = () => {
  likedTabButton.style.backgroundColor = '#e2e2e2';
  heart.style.color = 'olive';
  likedTabButton.style.cursor = 'default';
};

document.addEventListener('DOMContentLoaded', function () {
  //sets event listeners to the marker selection dialog tabs
  changeDialogStyling('CreatedIn');
});
