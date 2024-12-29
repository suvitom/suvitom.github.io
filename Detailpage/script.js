let language = localStorage.getItem('kieli') || 'fi';

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

const addTextToTheDetailPage = async () => {
  const sculptures = await fetchSculptures();
  
  if (sculptures.length === 0) {
    const div = document.createElement('div');
    div.textContent = language === 'fi' ? 'Tietoja ei voitu hakea.' : 'Failed to get information.';
    h2.appendChild(div);
    return; 
  }

  const sculpt = sculptures.find(scul => scul.id === Number(id));

  const h2 = document.getElementById('h2');
  const div1 = document.getElementById('div1');
  const div2 = document.getElementById('div2');
  const btntext = document.getElementById('btntext');
  const imageLink = document.getElementById('imageLink');

  const shortened = shortenCaption(sculpt, language, false);

  div1.textContent = shortened;
  imageLink.href = sculpt.picture_url;
  imageLink.textContent = language === 'fi' ? "Kuva" : "Image";
  h2.textContent = language === 'fi' ? sculpt.name_fi : sculpt.name_en || '';
  div2.textContent = language === 'fi' ? sculpt.desc_fi : sculpt.desc_en || '';
  btntext.textContent = language === 'fi' ? 'takaisin' : 'back';
};

document.addEventListener('DOMContentLoaded', function () {
  addTextToTheDetailPage();
});
