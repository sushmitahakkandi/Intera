const fs = require('fs');
const path = require('path');

const trackerPath = path.join(__dirname, '../seeders/sofa_batch_tracker.json');
const tracker = JSON.parse(fs.readFileSync(trackerPath, 'utf8'));

console.log(`Loaded ${tracker.length} products from tracker.`);

const metalSteelItems = tracker.filter(item => {
  const mat = item.material.toLowerCase();
  return mat === 'metal' || mat === 'steel';
});

console.log(`Found ${metalSteelItems.length} Metal/Steel items.`);

metalSteelItems.forEach((item, index) => {
  console.log(`${index + 1}. ID: ${item.id}, Name: "${item.name}", Material: "${item.material}", S3: "${item.s3Url}"`);
});
