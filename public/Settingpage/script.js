const logoutBtn = document.getElementById('logout');
const deleteAcBtn = document.getElementById('deleteAccount');
const language = localStorage.getItem('language') || 'fi';
const fi = language == 'fi';

const addText = () => {
  logoutBtn.textContent = fi ? 'Kirjaudu ulos' : 'Log out';
  deleteAcBtn.textContent = fi ? 'Poista tili' : 'Delete account';
};

const deleteAccount = () => {
  console.log('account has been deleted');
};

const logOut = async () => {
  await firebase.auth().signOut();
  setTimeout(() => {
    window.location.href = '../Map_page/Map_page.html';
  }, 500);
};

document.addEventListener('DOMContentLoaded', function () {
  initializeFirebase();
  addText();
});
