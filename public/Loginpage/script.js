let language = localStorage.getItem('language') || 'fi';

const initAuthUI = () => {
  const {auth, db} = initializeFirebase();
  const ui = new firebaseui.auth.AuthUI(auth);

  const uiConfig = {
    signInOptions: [
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
      },
    ],
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        console.log('Login succesful!', authResult.user);
        console.log(redirectUrl);
        window.location.href = '../Map_page/Map_page.html';
      },
    },
  };

  if (ui.isPendingRedirect()) {
    ui.start('#firebaseui-auth-container', uiConfig);
  } else if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
    ui.start('#firebaseui-auth-container', uiConfig);
  } else {
    ui.start('#firebaseui-auth-container', uiConfig);
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await loadFirebaseUILanguage(language);
  initAuthUI();
});

const loadFirebaseUILanguage = language => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth__${language}.js`;
    script.defer = true;

    script.onload = resolve;
    script.onerror = reject;

    document.head.appendChild(script);
  });
};

const title = document.getElementsByClassName('firebaseui-title')[0];
const email = document.getElementsByClassName('firebaseui-label')[0];
const button = document.getElementsByClassName('firebaseui-button')[0];
const container = document.getElementsByClassName('firebaseui-auth-container')[0];
