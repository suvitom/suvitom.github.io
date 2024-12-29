let language = localStorage.getItem('kieli') || 'fi';

const chapters = document.getElementById('chapters');
const title = document.getElementById('title');
const btntext = document.getElementById('btntext');
const helsinkiphoto = document.getElementById('helsinkiphoto');
const photolink = document.getElementById('photolink');
           
const images = {
  aleksanteri: {
    link: "https://unsplash.com/@malyushev",
    linkText: "Aleksanteri II, image: Victor Malyushev, unsplash.com",
    filepath: "images/Aleksanteri.jpg",
  },
  sibelius: {
    link: "https://unsplash.com/@satususannas",
    linkText: "Sibelius Monument, image: Satu Susanna, unsplash.com",
    filepath: "images/Sibelius.jpg",
  },
  railwaystation: {
    link: "https://unsplash.com/@alkomosh",
    linkText: "image: Alexander Kovalev, unsplash.com",
    filepath: "images/Railwaystation.jpg",
  },
  havisamanda: {
    link: "https://unsplash.com/@megurine_nimu",
    linkText: "Havis Amanda, image: nimu, unsplash.com",
    filepath: "images/HavisAmanda.jpg",
  }
};

const setImage = () => {
  const keys = Object.keys(images);
  const randomIndex = Math.floor(Math.random() * keys.length);
  const randomKey = keys[randomIndex];
  const randomImage = images[randomKey];

  helsinkiphoto.src = randomImage.filepath || "";
  photolink.href = randomImage.link || "";
  photolink.textContent = randomImage.linkText || "";
};
           
const setTextContent = (lang) => {
  const h2_1 = document.createElement('h2');
  const h2_2 = document.createElement('h2');
  const div1 = document.createElement('div');
  const div2 = document.createElement('div');
  const div3 = document.createElement('div');
  const br1 = document.createElement('br');
  const br2 = document.createElement('br');

  div1.classList.add('chaptr');
  div2.classList.add('chaptr');
  div3.classList.add('chaptr');

  h2_1.textContent =
    lang === 'fi' ? 'Tietoa palvelusta' : 'Information about the service';
  h2_2.textContent = lang === 'fi'
      ? 'Tietoa Helsingin veistoksista'
      : "Information about Helsinki's sculptures";
  div1.textContent = lang === 'fi'
      ? serviceDescr_fi
      : serviceDescr_en;
  div2.textContent =
    lang === 'fi'
      ? history1_fi
      : history1_en;
  div3.textContent =
    lang === 'fi'
      ? history2_fi
      : history2_en;
  title.textContent = lang === 'fi' ? 'Helsingin veistokset' : 'Sculptures of Helsinki';   
  btntext.textContent = lang === 'fi' ? 'siirry kartalle' : 'to the map';   

  const elements = [h2_1, div1, br1, h2_2, div2, br2, div3];
  elements.forEach(element => chapters.appendChild(element));
};

const changeLanguage = lang => {
  while (chapters.firstChild) {
    chapters.removeChild(chapters.firstChild);
  }
  localStorage.setItem('kieli', lang);
  setTextContent(lang);
};
 
document.addEventListener('DOMContentLoaded', function () {
  setTextContent(language);
  setImage();
});

