let language = localStorage.getItem('language') || 'fi';

const chapters = document.getElementById('chapters');
const title = document.getElementById('title');
const btntext = document.getElementById('mapButton');
const helsinkiphoto = document.getElementById('helsinkiphoto');
const photolink = document.getElementById('photolink');

const images = {
  aleksanteri: {
    link: 'https://unsplash.com/@malyushev',
    linkText: 'Aleksanteri II IMG: Victor Malyushev, unsplash.com',
    filepath: 'Frontpage/images/Aleksanteri.jpg',
  },
  sibelius: {
    link: 'https://unsplash.com/@satususannas',
    linkText: 'Sibelius Monument IMG: Satu Susanna, unsplash.com',
    filepath: 'Frontpage/images/Sibelius.jpg',
  },
  havisamanda: {
    link: 'https://unsplash.com/@megurine_nimu',
    linkText: 'Havis Amanda IMG: nimu, unsplash.com',
    filepath: 'Frontpage/images/HavisAmanda.jpg',
  },
};

const setImage = () => {
  const keys = Object.keys(images);
  const randomIndex = Math.floor(Math.random() * keys.length);
  const randomKey = keys[randomIndex];
  const randomImage = images[randomKey];

  helsinkiphoto.src = randomImage.filepath || '';
  photolink.href = randomImage.link || '';
  photolink.textContent = randomImage.linkText || '';
};

const createLink = () => {
  const a = document.createElement('a');
  a.id = 'wikipedia';
  a.href = 'https://fi.wikipedia.org/wiki/Luettelo_Helsingin_julkisista_taideteoksista_ja_muistomerkeistä';
  a.textContent =
    language === 'fi'
      ? 'Wikipedia, Luettelo Helsingin Julkisista Taideteoksista ja Muistomerkeistä'
      : 'Wikipedia, List of Public Artworks and Monuments in Helsinki';
  return a;
};

const create_Element = (tag, text) => {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
};

const setTextContent = () => {
  const fi = language === 'fi';

  const h2_1 = create_Element('h2', fi ? 'Tietoa palvelusta' : 'About the service');
  const h2_2 = create_Element('h2', fi ? 'Tietoa Helsingin veistoksista' : "About Helsinki's sculptures");
  const div1 = create_Element('div', fi ? serviceDescr_fi : serviceDescr_en);
  const div2 = create_Element('div', fi ? history1_fi : history1_en);
  const div3 = create_Element('div', fi ? history2_fi : history2_en);
  const br1 = document.createElement('br');
  const br2 = document.createElement('br');
  const a = createLink();
  btntext.textContent = fi ? 'siirry kartalle' : 'to the map';
  title.textContent = fi ? 'Helsingin veistokset' : 'Sculptures of Helsinki';

  div1.classList.add('chaptr');
  div2.classList.add('chaptr');
  div3.classList.add('chaptr');

  div3.appendChild(a);
  const elements = [h2_1, div1, br1, h2_2, div2, br2, div3];
  elements.forEach(element => chapters.appendChild(element));
};

const changeLanguage = lang => {
  while (chapters.firstChild) {
    chapters.removeChild(chapters.firstChild);
  }
  Array.from(title.childNodes).forEach(child => {
    if (child.nodeName !== 'IMG') {
      title.removeChild(child);
    }
  });

  localStorage.setItem('language', lang);
  language = lang;
  setTextContent();
};

document.addEventListener('DOMContentLoaded', function () {
  setTextContent();
  setImage();
});
