const logoutBtn = document.getElementById('logout');
const deleteAcBtn = document.getElementById('deleteAccount');
const language = localStorage.getItem('language') || 'fi';
const fi = language == 'fi';
let currentUser = null;

const addText = () => {
  logoutBtn.textContent = fi ? 'Kirjaudu ulos' : 'Log out';
  deleteAcBtn.textContent = fi ? 'Poista tili' : 'Delete account';
};

const deleteAccount = () => {
  console.log('currentUser', currentUser);
  if (currentUser) {
    firebase
      .firestore()
      .collection('users')
      .doc(String(currentUser.uid))
      .delete() // tämä ei poista veistoksia, korjaa!
      .then(() => {
        return currentUser.delete();
      })
      .catch(error => {
        console.error('Error in deleting user:', error);
      });
  }
  goBack();
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
  auth.onAuthStateChanged(async user => {
    currentUser = user;
  });
  addText();
});
