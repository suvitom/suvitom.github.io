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
    if (!user) {
      document.getElementById('heart').style.display = 'none';
    } else {
      heartIcon.style.color = (await checkIfSaved(sculptId, user)) ? '#d13b95' : 'white';
      heartIcon.onclick = () => saveOrRemoveSculpt(sculptId, user, heartIcon, language);
    }
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

const saveOrRemoveSculpt = async (sculptId, user, heartIcon, lang) => {
  try {
    const {docSnap, docRef} = await getDocSnap(sculptId, user);
    const outlines = document.querySelector('.outlines');

    if (docSnap.exists) {
      await docRef.delete();
      console.log('deleted:', sculptId);
      heartIcon.style.color = 'white';
      outlines.classList.remove('fa-solid');
      outlines.classList.add('fa-regular');
      showMessage(lang == 'fi' ? 'poistettu suosikeista' : 'removed from favourites');
    } else {
      await docRef.set({createdAt: firebase.firestore.FieldValue.serverTimestamp()});
      console.log('saved:', sculptId);
      heartIcon.style.color = '#d13b95';
      outlines.classList.remove('fa-regular');
      outlines.classList.add('fa-solid');
      showMessage(lang == 'fi' ? 'tallennettu suosikiksi' : 'saved to favourites');
    }
  } catch (error) {
    console.error('Error saving or deleting sculpture as a favorite:', error);
  }
};

const showMessage = message => {
  const savingInfo = document.getElementById('savingInfo');
  savingInfo.textContent = message;
  setTimeout(() => {
    savingInfo.textContent = '';
  }, 3000);
};

const checkIfSaved = async (sculptId, user) => {
  const {docSnap, docRef} = await getDocSnap(sculptId, user);
  if (!docSnap) return false;
  return docSnap.exists;
};

const getDocSnap = async (sculptId, user) => {
  if (!user) return {docSnap: undefined, docRef: undefined};
  const docRef = db.collection('users').doc(String(user.uid)).collection('favourites').doc(String(sculptId));
  const docSnap = await docRef.get();

  return {docSnap, docRef};
};

document.addEventListener('DOMContentLoaded', function () {
  const {auth, database} = initializeFirebase();
  db = database;
  addTextToDetailPage(auth);
});
