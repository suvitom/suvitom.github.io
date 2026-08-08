let language = localStorage.getItem('language') || 'fi';

const chapters = document.getElementById('chapters');
const title = document.getElementById('title');
const btntext = document.getElementById('btntext');
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

const createLink = topic => {
  const a = document.createElement('a');
  a.id = topic;
  if (topic == 'wikipedia') {
    a.href = 'https://fi.wikipedia.org/wiki/Luettelo_Helsingin_julkisista_taideteoksista_ja_muistomerkeistä';
    a.textContent =
      language === 'fi'
        ? 'Wikipedia, Luettelo Helsingin Julkisista Taideteoksista ja Muistomerkeistä'
        : 'Wikipedia, List of Public Artworks and Monuments in Helsinki';
  } else {
    a.href = 'https://www.hamhelsinki.fi/julkinen-taide/tutustu-teoksiin/?em_l=list&em_s=asc&em_t=title';
    a.textContent =
      language === 'fi' ? 'HAM, Helsingin julkisen taiteen teokset' : 'HAM, Helsinki’s public artworks';
  }

  return a;
};

const create_Element = (tag, text) => {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
};

const setTextContent = () => {
  const fi = language === 'fi';

  //const h2_1 = create_Element('h2', fi ? 'Tietoa palvelusta' : 'About the service');

  const div1 = create_Element('div', fi ? serviceDescr_fi : serviceDescr_en);
  const div2 = create_Element('div', fi ? moreInfo_fi : moreInfo_en);

  const br1 = document.createElement('br');
  const br2 = document.createElement('br');

  const a = createLink('wikipedia');
  const a2 = createLink('ham');

  btntext.textContent = fi ? 'siirry kartalle' : 'to the map';
  title.textContent = fi ? 'Helsingin veistokset' : 'Sculptures of Helsinki';

  div1.classList.add('chaptr');

  const elements = [div1, br1, div2, br2, a, a2];
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
