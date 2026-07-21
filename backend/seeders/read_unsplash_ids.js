const fs = require('fs');
const path = require('path');

const idsPath = path.join(__dirname, 'unsplash_ids.json');
if (fs.existsSync(idsPath)) {
  const data = JSON.parse(fs.readFileSync(idsPath, 'utf8'));
  console.log('Categories in unsplash_ids.json:', Object.keys(data));
  if (data.sofa) {
    console.log(`Number of sofa photo IDs: ${data.sofa.length}`);
    console.log('Sample sofa photo URLs (first 5):');
    console.log(data.sofa.slice(0, 5));
  } else {
    console.log('No sofa category found in unsplash_ids.json');
  }
} else {
  console.log('unsplash_ids.json not found!');
}
