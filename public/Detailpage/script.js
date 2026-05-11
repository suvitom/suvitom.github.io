let db = null;

function getLocalData() {
  const language = localStorage.getItem('language') || 'fi';
  let caption = localStorage.getItem('caption') || '';
  const description = localStorage.getItem('description') || '';
  const name = localStorage.getItem('name') || '';
  let url = localStorage.getItem('url') || null;
  const sculptId = localStorage.getItem('sculptId') || null;

  if (caption && caption.toLowerCase().includes('undefined')) {
    caption = '';
  }

  if (url && url.toLowerCase().includes('ei-kuvaa')) {
    url = null;
  }

  return {language, caption, description, name, url, sculptId};
}

const addTextToDetailPage = async auth => {
  const h2 = document.getElementById('h2');
  const div1Top = document.getElementById('div1');
  const br = document.getElementById('br');
  const div2Bottom = document.getElementById('div2');
  const img = document.getElementById('sculptImg');
  const button = document.getElementById('btn');
  const heartIcon = document.getElementsByTagName('i')[0];

  const {language, caption, description, name, url, sculptId} = getLocalData();

  auth.onAuthStateChanged(async user => {
    heartIcon.style.color = (await checkIfSaved(sculptId, user)) ? '#9243d7' : 'whitesmoke';
  });

  if (!caption) {
    br.remove();
  }

  url ? (img.src = url) : img.remove();

  const newText = document.createTextNode(language === 'fi' ? 'takaisin' : 'back');
  button.appendChild(newText);

  h2.textContent = name;
  div1Top.textContent = caption;
  div2Bottom.textContent = description.trim() != 'undefined' ? description : '';
};

const checkIfSaved = async (sculptId, user) => {
  const {docSnap, docRef} = await getDocSnap(sculptId, user);
  return docSnap.exists;
};

const getDocSnap = async (sculptId, user) => {
  const docRef = db.collection('users').doc(String(user.uid)).collection('favourites').doc(String(sculptId));
  const docSnap = await docRef.get();
  return {docSnap, docRef};
};

document.addEventListener('DOMContentLoaded', function () {
  const {auth, database} = initializeFirebase();
  db = database;
  addTextToDetailPage(auth);
});
