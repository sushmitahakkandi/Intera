import fs from 'fs';
import https from 'https';

const file = fs.createWriteStream('empty_room.jpg');
https.get('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download complete.');
  });
});
