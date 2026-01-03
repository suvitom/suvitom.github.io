const signIn = () => {
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

document.addEventListener('DOMContentLoaded', function () {
  signIn();
});
