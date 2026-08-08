document.addEventListener('DOMContentLoaded', function () {
  const {auth, database} = initializeFirebase();
  db = database;

  auth.onAuthStateChanged(async user => {
    updateFavSideView(user);
    currentUser = user;

    let favouriteIds = new Set();
    if (user) {
      const snaps = await db.collection('users').doc(user.uid).collection('favourites').get();
      snaps.forEach(sculpt => favouriteIds.add(sculpt.id));
    }
    favIds = favouriteIds;
    addSculptures('def_radio', favouriteIds);
  });

  addTextToThePage();
  setOpacitySliderVal();
});
