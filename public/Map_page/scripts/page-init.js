document.addEventListener('DOMContentLoaded', function () {
  const {auth, database} = initializeFirebase();
  db = database;
  let unsubscribeFavourites = null;

  auth.onAuthStateChanged(async user => {
    updateFavSideView(user);
    currentUser = user;
    let favouriteIds = new Set();

    // Unsubscribe the old listener before creating a new one
    if (unsubscribeFavourites) {
      unsubscribeFavourites();
      unsubscribeFavourites = null;
    }

    //suosikit tallennetaan kaksi kertaa, onko tarpeellista??
    if (user) {
      const snaps = await db.collection('users').doc(user.uid).collection('favourites').get();
      snaps.forEach(sculpt => favouriteIds.add(sculpt.id));
    }
    favIds = favouriteIds;
    addSculptures('def_radio', favouriteIds);

    if (user) {
      const docRef = db.collection('users').doc(String(user.uid)).collection('favourites');
      unsubscribeFavourites = docRef.onSnapshot(querySnapshot => {
        const favourites = [];
        querySnapshot.forEach(doc => {
          favourites.push({id: doc.id, ...doc.data()});
        });
        updateFavShow(favourites);
      });
    }
  });

  addTextToThePage();
  setOpacitySliderVal();
});
