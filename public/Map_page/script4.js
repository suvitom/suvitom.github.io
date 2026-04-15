const state = {
  browsing: true,
  yearBuilt: false,
  favourites: false,
};

const changeRightHandView = key => {
  Object.keys(state).forEach(k => {
    state[k] = k === key;

    const element = document.querySelector(`.${k}.dot`);

    if (element) {
      element.style.color = state[k] ? '#693dcf' : '#a8a8a8';
    }
  });
};
