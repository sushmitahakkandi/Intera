const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const BED_KEYWORDS = [
  'bed frame',
  'wooden bed frame',
  'platform bed',
  'upholstered bed',
  'king bed frame',
  'queen bed frame',
  'single bed frame',
  'double bed frame',
  'metal bed frame',
  'hydraulic storage bed',
  'minimalist bed',
  'luxury bed',
  'solid wood bed',
  'modern bed design'
];

const humanKeywords = [
  'person', 'people', 'man', 'woman', 'human', 'sleep', 'couple', 'girl', 'boy', 'child', 'baby', 'model',
  'posing', 'lifestyle', 'morning', 'sleeping', 'legs', 'feet', 'relaxing', 'bedtime', 'waking', 'love',
  'female', 'male', 'young', 'adult', 'kid', 'childhood', 'family', 'hand', 'leg', 'face', 'portrait',
  'sit', 'sat', 'sitting', 'lie', 'lying', 'relax', 'chill', 'chilling', 'hug', 'kiss', 'happy', 'smile',
  'smiling', 'joy', 'body', 'guy', 'lady', 'selfie', 'photo', 'photographer', 'crowd', 'spectator',
  'tourist', 'clothed', 'clothing', 'apparel', 'dress', 'shirt', 'jeans', 'pants', 'jacket', 'wear', 'wearing',
  'mother', 'father', 'parent', 'son', 'daughter', 'grandparent', 'grandma', 'grandpa', 'hugged', 'hugging',
  'holding', 'touching', 'footwear', 'shoe', 'shoes', 'sock', 'socks', 'arm', 'shoulder', 'hair', 'skin',
  'eye', 'eyes', 'mouth', 'nose', 'belly', 'chest', 'back', 'head', 'blonde', 'brunette'
];

const hasHuman = (photo) => {
  const tags = (photo.tags || []).map(t => (t.title || '').toLowerCase());
  const desc = (photo.description || '').toLowerCase();
  const altDesc = (photo.alt_description || '').toLowerCase();

  for (const kw of humanKeywords) {
    if (desc.includes(kw) || altDesc.includes(kw)) {
      return true;
    }
    for (const tag of tags) {
      if (tag.includes(kw)) {
        return true;
      }
    }
  }
  return false;
};

async function testFetch() {
  const collected = [];
  const seen = new Set();
  let kwIdx = 0;
  let page = 1;
  const targetCount = 400;

  while (collected.length < targetCount && kwIdx < BED_KEYWORDS.length) {
    const keyword = BED_KEYWORDS[kwIdx];
    const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(keyword)}&per_page=30&page=${page}`;
    try {
      console.log(`query="${keyword}" page=${page} collected=${collected.length}`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        kwIdx++; page = 1; continue;
      }

      for (const photo of data.results) {
        if (!photo.urls?.raw) continue;
        if (hasHuman(photo)) {
          // console.log(`Skipped human/lifestyle photo: ${photo.urls.raw.split('?')[0]}`);
          continue;
        }

        const baseUrl = photo.urls.raw.split('?')[0];
        if (!seen.has(baseUrl)) {
          seen.add(baseUrl);
          collected.push(baseUrl);
        }
        if (collected.length >= targetCount) break;
      }

      page++;
      await sleep(150);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      await sleep(1000);
      kwIdx++;
      page = 1;
    }
  }

  console.log(`Collected ${collected.length} unique bed images without humans.`);
}

testFetch();
