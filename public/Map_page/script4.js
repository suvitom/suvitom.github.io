const state = {
  browsing: true,
  map: false,
  favourites: false,
  top: false,
};
const sideBar = document.getElementById('sideBar');

const changeRightHandView = key => {
  changeTabColorAndState(key);

  for (const child of sideBar.children) {
    child.style.display = 'none';
  }
  const element = document.querySelector(`#${key}Content`);

  if (element) {
    element.style.display = 'flex';
  }
};

const changeTabColorAndState = key => {
  // If the input key is included in state, it is set to true; otherwise false.
  Object.keys(state).forEach(k => {
    state[k] = k === key;

    const element = document.querySelector(`.${k}.dot`);

    if (element) {
      element.style.color = state[k] ? '#693dcf' : '#a8a8a8';
    }
  });
};
