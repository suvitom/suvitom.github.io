function getLocalData() {
  const language = localStorage.getItem('language') || 'fi';
  let caption = localStorage.getItem('caption') || '';
  const description = localStorage.getItem('description') || '';
  const name = localStorage.getItem('name') || '';
  let url = localStorage.getItem('url') || null;

  if (caption && caption.toLowerCase().includes('undefined')) {
    caption = '';
  }

  if (url && url.toLowerCase().includes('ei-kuvaa')) {
    url = null;
  }

  return {language, caption, description, name, url};
}

const addTextToDetailPage = async () => {
  const h2 = document.getElementById('h2');
  const div1Top = document.getElementById('div1');
  const br = document.getElementById('br');
  const div2Bottom = document.getElementById('div2');
  const img = document.getElementById('sculptImg');
  const button = document.getElementById('btn');

  const {language, caption, description, name, url} = getLocalData();

  if (!caption) {
    br.remove();
  }

  url ? (img.src = url) : img.remove();

  const newText = document.createTextNode(language === 'fi' ? 'takaisin' : 'back');
  button.appendChild(newText);

  h2.textContent = name;
  div1Top.textContent = caption;
  div2Bottom.textContent = description;
};

document.addEventListener('DOMContentLoaded', function () {
  addTextToDetailPage();
});
