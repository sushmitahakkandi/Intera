const http = require('http');

http.get('http://localhost:5000/uploads/products/general/thumbnail.webp', (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  res.resume();
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
