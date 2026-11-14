const logoutBtn = document.getElementById('logout');
const deleteAcBtn = document.getElementById('deleteAccount');
const language = localStorage.getItem('language') || 'fi';
const fi = language == 'fi';
let currentUser = null;
let fbauth = null;
let fbdb = null;

const addText = () => {
  logoutBtn.textContent = fi ? 'Kirjaudu ulos' : 'Log out';
  deleteAcBtn.textContent = fi ? 'Poista tili' : 'Delete account';
};

// const deleteAccount = () => {
//   if (currentUser) {
//     const uid = String(currentUser.uid);
//     const userDocRef = firebase.firestore().collection('users').doc(uid);

//     // 1. Retrieves and deletes all the favourites
//     userDocRef
//       .collection('favourites')
//       .get()
//       .then(snapshot => {
//         const batch = firebase.firestore().batch();
//         snapshot.docs.forEach(doc => batch.delete(doc.ref));
//         return batch.commit();
//       })
//       .then(() => {
//         return userDocRef.delete();
//       })
//       //. 2. Deletes the user account
//       .then(() => {
//         return currentUser.delete();
//       })
//       .then(() => {
//         goBack();
//       })
//       .catch(error => {
//         console.error('Error in deleting user:', error);
//       });
//   } else {
//     goBack();
//   }
// };

// Sign out and send the user to the login page to re-authenticate
const requireNewLogin = async () => {
  alert(
    fi
      ? 'Turvallisuussyistä kirjaudu uudelleen ja yritä poistoa uudestaan.'
      : 'For security reasons, please sign in again and then retry the deletion.',
  );
  await fbauth.signOut();
  window.location.href = '../Loginpage/Loginpage.html';
};

const deleteAccount = async () => {
  if (!currentUser) {
    goBack();
    return;
  }

  const confirmed = confirm(
    fi
      ? 'Haluatko varmasti poistaa tilisi ja kaikki tietosi? Tätä ei voi perua.'
      : 'Are you sure you want to delete your account and all your data? This cannot be undone.',
  );
  if (!confirmed) return;

  try {
    // 1. Check that the login is recent (Firebase requires roughly 5 minutes)
    const {authTime} = await currentUser.getIdTokenResult();
    const ageMs = Date.now() - new Date(authTime).getTime();

    if (ageMs > 4 * 60 * 1000) {
      await requireNewLogin();
      return;
    }

    const userDocRef = fbdb.collection('users').doc(String(currentUser.uid));

    // 2. Retrieve and delete all the favourites
    const snapshot = await userDocRef.collection('favourites').get();
    const batch = fbdb.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // 3. Delete the user document
    await userDocRef.delete();

    // 4. Delete the user account
    await currentUser.delete();

    goBack();
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      // Fallback in case the pre-check missed it
      await requireNewLogin();
    } else {
      console.error('Error in deleting user:', error);
      alert(
        fi
          ? 'Käyttäjätilin poisto epäonnistui. Yritä uudelleen.'
          : 'Deleting the account failed. Please try again.',
      );
    }
  }
};

const goBack = () => {
  window.location.href = '../Map_page/Map_page.html';
};

const logOut = async () => {
  await firebase.auth().signOut();
  setTimeout(() => {
    goBack();
  }, 500);
};

document.addEventListener('DOMContentLoaded', function () {
  const {auth, database} = initializeFirebase();
  fbauth = auth;
  fbdb = database;
  auth.onAuthStateChanged(async user => {
    currentUser = user;
  });
  addText();
});
