const cutDescrByFirstDot = (capt) => {
  let firstDotIndex = capt.indexOf('.');
  let shrtn = firstDotIndex !== -1 ? capt.substring(0, firstDotIndex + 1) : '';
  return shrtn;
}

const cutDescrByFirstColon = (capt) => {
  let firstColonIndex = capt.indexOf(':');
  let shrtn = firstColonIndex !== -1 ? capt.substring(0, firstColonIndex) : '';
  return shrtn;
}

const shortenCaption = (sculpt, language, artist) => {
  let shortened = ''; 

  if (language === 'fi') {
    let capt_fi = sculpt.picture_caption_fi ? sculpt.picture_caption_fi : '';
    shortened = artist ? cutDescrByFirstColon(capt_fi) : cutDescrByFirstDot(capt_fi);
    shortened = shortened.replace(
      'Et voi käyttää kuvaa kaupallisiin tarkoituksiin.',
      '',
    );
  }

  if (language === 'en') {
    let capt_en = sculpt.picture_caption_en ? sculpt.picture_caption_en : '';
    shortened = artist ? cutDescrByFirstColon(capt_en) : cutDescrByFirstDot(capt_en);
    shortened = shortened.replace(
      'You may not use this photo for commercial purposes.',
      '',
    );
  }

  return shortened;
};

const departmentId = '0afb1cd8-726d-4900-8a7f-5e3447e8f477';
const url = `https://www.hel.fi/palvelukarttaws/rest/v4/unit/?department=${departmentId}`;

const fetchSculptures = async () => {
  let data = null; 
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network request failed');
    }
    const d = await response.json();
    data = d;
    console.log(data)
  } catch (error) {
    console.error('Error in fetching sculpture data:', error);
    data = [];
  }
  return data;
};
