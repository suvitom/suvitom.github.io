// ===== AUTHENTICATION =====
// Handle login, logout, and auth state changes.
const setLoginLogoutBtn = async fi => {
  const loginButton = document.getElementById('logInOrOut');

  const user = await waitForAuth();

  if (user) {
    loginButton.textContent = fi ? 'Asetukset' : 'User settings';
    loginButton.onclick = goToSettingPage;
  } else {
    loginButton.textContent = fi ? 'Kirjaudu ☕︎' : 'Sign In ☕︎';
    loginButton.onclick = goToLoginPage;
  }
};

const signOut = async () => {
  await firebase.auth().signOut();
  setLoginLogoutBtn(language === 'fi');
  currentUser = null;
  favIds = new Set();
};

const goToLoginPage = () => {
  window.location.href = '../Loginpage/Loginpage.html';
};

const goToSettingPage = () => {
  window.location.href = '../Settingpage/Usersettingpage.html';
};

const waitForAuth = () => {
  return new Promise(resolve => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    });
  });
};
