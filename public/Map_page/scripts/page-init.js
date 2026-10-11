document.addEventListener('DOMContentLoaded', function () {
  const {auth, database} = initializeFirebase();
  db = database;
  let unsubscribeFavourites = null;
  let sculpturesAdded = false;

  //Runs only on the initial page load
  const loadInitialMarkers = () => {
    if (!sculpturesAdded) {
      addSculptures('def_radio');
      sculpturesAdded = true;
    }
  };

  auth.onAuthStateChanged(async user => {
    updateFavSideView(user);
    currentUser = user;
    refreshPopupForAllMarkers();

    // Unsubscribe the old listener before creating a new one
    if (unsubscribeFavourites) {
      unsubscribeFavourites();
      unsubscribeFavourites = null;
    }

    if (user) {
      const docRef = db.collection('users').doc(String(user.uid)).collection('favourites');
      unsubscribeFavourites = docRef.onSnapshot(querySnapshot => {
        const favourites = new Map();
        querySnapshot.forEach(doc => {
          favourites.set(doc.id, {id: doc.id, ...doc.data()});
        });
        globFavourites = favourites;
        renderFavList();
        refreshPopupForAllMarkers();
        changeSculptIcon(checkSelectedRadioBtn());
      });
    }
  });

  loadInitialMarkers();
  addTextToThePage();
  setOpacitySliderVal();
});
