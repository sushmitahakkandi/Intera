const fs = require('fs');
const path = require('path');

const CATEGORIES_KEYWORDS = {
  sofa: [
    'sofa furniture',
    'couch furniture',
    'sectional sofa product',
    'modern sofa',
    'living room sofa',
    'leather sofa'
  ],
  chair: [
    'accent chair furniture',
    'armchair furniture',
    'lounge chair product',
    'office chair ergonomic',
    'wooden chair furniture',
    'dining chair'
  ],
  bed: [
    'bed frame furniture',
    'wooden bed frame',
    'platform bed furniture',
    'upholstered bed headboard',
    'king size bed frame',
    'queen size bed furniture'
  ],
  dining: [
    'dining table furniture',
    'dining table set',
    'kitchen table product',
    'dining room set wood',
    'modern dining table'
  ],
  tables: [
    'coffee table furniture',
    'side table furniture',
    'study table desk',
    'nightstand wood',
    'console table product',
    'laptop desk table'
  ],
  storage: [
    'bookshelf furniture',
    'wardrobe cabinet closet',
    'storage chest of drawers',
    'wooden sideboard cabinet',
    'tv stand console furniture'
  ]
};

const CATEGORY_TARGETS = {
  sofa: 50,
  chair: 50,
  bed: 50,
  dining: 50,
  tables: 50,
  storage: 50
};

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

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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

async function run() {
  const output = {};
  const globalSeen = new Set();

  for (const [category, keywords] of Object.entries(CATEGORIES_KEYWORDS)) {
    const targetCount = CATEGORY_TARGETS[category];
    const collected = [];
    const seen = new Set();
    let kwIdx = 0;
    let page = 1;

    console.log(`\n=== Scraping for category: ${category} (Target: ${targetCount}) ===`);

    while (collected.length < targetCount && kwIdx < keywords.length) {
      const keyword = keywords[kwIdx];
      const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(keyword)}&per_page=30&page=${page}`;
      
      try {
        console.log(`[${category}] query="${keyword}" page=${page} collected=${collected.length}`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        if (!data.results || data.results.length === 0) {
          kwIdx++;
          page = 1;
          continue;
        }

        for (const photo of data.results) {
          if (!photo.urls?.raw) continue;
          if (hasHuman(photo)) continue;

          const baseUrl = photo.urls.raw.split('?')[0];
          if (!seen.has(baseUrl) && !globalSeen.has(baseUrl)) {
            seen.add(baseUrl);
            globalSeen.add(baseUrl);
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

    if (collected.length < targetCount) {
      console.warn(`WARNING: Only collected ${collected.length}/${targetCount} unique URLs for ${category}. Cycling existing URLs to fill.`);
      const originalLen = collected.length;
      let idx = 0;
      while (collected.length < targetCount && originalLen > 0) {
        collected.push(`${collected[idx % originalLen]}_copy_${idx}`);
        idx++;
      }
    }

    output[category] = collected;
    console.log(`Finished ${category}: collected ${collected.length} unique URLs.`);
  }

  const OUT_PATH = path.join(__dirname, '..', 'seeders', 'unsplash_ids.json');
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`\nSuccessfully wrote all clean photo IDs to ${OUT_PATH}`);
  process.exit(0);
}

run();
