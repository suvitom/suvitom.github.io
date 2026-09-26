document.addEventListener('DOMContentLoaded', function () {
  const {auth, database} = initializeFirebase();
  db = database;
  let unsubscribeFavourites = null;
  let sculpturesAdded = false;

  auth.onAuthStateChanged(async user => {
    updateFavSideView(user);
    currentUser = user;
    //let favouriteIds = new Set();

    // Unsubscribe the old listener before creating a new one
    if (unsubscribeFavourites) {
      unsubscribeFavourites();
      unsubscribeFavourites = null;
    }

    //suosikit tallennetaan kaksi kertaa, onko tarpeellista??
    // if (user) {
    //   const snaps = await db.collection('users').doc(user.uid).collection('favourites').get();
    //   snaps.forEach(sculpt => favouriteIds.add(sculpt.id));
    // }
    // favIds = favouriteIds;

    // if (user) {
    //   const docRef = db.collection('users').doc(String(user.uid)).collection('favourites');
    //   unsubscribeFavourites = docRef.onSnapshot(querySnapshot => {
    //     const favourites = [];
    //     querySnapshot.forEach(doc => {
    //       favourites.push({id: doc.id, ...doc.data()});
    //     });
    //     updateFavShow(favourites);
    //   });
    // }

    if (user) {
      const docRef = db.collection('users').doc(String(user.uid)).collection('favourites');
      unsubscribeFavourites = docRef.onSnapshot(querySnapshot => {
        const favourites = new Map();
        querySnapshot.forEach(doc => {
          favourites.set(doc.id, {id: doc.id, ...doc.data()});
        });
        globFavourites = favourites;
        renderFavList();
        //Runs only on the initial page load
        if (!sculpturesAdded) {
          addSculptures('def_radio');
          sculpturesAdded = true;
        }
      });
    }
  });

  addTextToThePage();
  setOpacitySliderVal();
});
