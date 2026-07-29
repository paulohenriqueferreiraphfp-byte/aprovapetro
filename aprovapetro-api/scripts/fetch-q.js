const https = require('https');
const fs = require('fs');

https.get('https://aprovapetro.onrender.com/api/questions', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('C:\\Users\\PC\\.gemini\\antigravity\\brain\\2b4d30c0-926f-4ef6-a664-1e75779a014e\\scratch\\questions2.json', data);
    console.log('Done!');
  });
});
