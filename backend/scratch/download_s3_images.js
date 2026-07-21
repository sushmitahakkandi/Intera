const axios = require('axios');
const fs = require('fs');
const path = require('path');

const urls = [
  "https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/products/sofa/mahaveer-stockholm-wood-modern-sofa/thumbnail.webp",
  "https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/products/sofa/mahaveer-stockholm-metal-luxury-sofa/thumbnail.webp",
  "https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/products/sofa/steelvibe-stockholm-leather-fabric-sofa/thumbnail.webp",
  "https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/products/sofa/leatherlux-stockholm-fabric-leather-sofa/thumbnail.webp",
  "https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/products/sofa/mahaveer-stockholm-velvet-wooden-sofa/thumbnail.webp",
  "https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/products/sofa/mahaveer-stockholm-solid-wood-l-shape-sofa/thumbnail.webp",
  "https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/products/sofa/mahaveer-stockholm-engineered-wood-corner-sofa/thumbnail.webp",
  "https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/products/sofa/modacasa-stockholm-steel-sectional-sofa/thumbnail.webp",
  "https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/products/sofa/sleekstudio-stockholm-wood-chesterfield-sofa/thumbnail.webp",
  "https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/products/sofa/mahaveer-stockholm-metal-loveseat/thumbnail.webp"
];

const downloadImages = async () => {
  const scratchDir = path.join(__dirname);
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const dest = path.join(scratchDir, `s3_image_${i}.webp`);
    console.log(`Downloading ${url} -> ${dest}`);
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
      });
      response.data.pipe(fs.createWriteStream(dest));
      console.log(`Downloaded image ${i}`);
    } catch (err) {
      console.error(`Failed to download ${i}:`, err.message);
    }
  }
};

downloadImages();
