const fs = require('fs');
const path = require('path');

const cats = ['sofa', 'chair', 'bed', 'dining', 'tables', 'storage'];

cats.forEach(c => {
  const src = path.join(__dirname, '..', 'uploads', 'cache', c, 'img-0.webp');
  const dest = path.join(__dirname, '..', 'uploads', 'categories', `${c}-thumbnail.webp`);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} to ${dest}`);
  } else {
    console.log(`Source ${src} does not exist`);
  }
});
