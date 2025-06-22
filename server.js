const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Token Store
const validTokens = new Map([
  ['abc123', { used: false, createdAt: Date.now() }]
]);

const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Static files (jukebox.html, songs.json)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('<h2>QR Code Verifier</h2><p>Use /verify?token=XYZ</p>');
});

app.get('/verify', (req, res) => {
  const token = req.query.token;

  if (!token) return res.status(400).send('Missing token.');

  const tokenData = validTokens.get(token);
  if (!tokenData) return res.status(401).send('Invalid token.');
  if (tokenData.used) return res.status(403).send('Token already used.');
  if (Date.now() - tokenData.createdAt > TOKEN_EXPIRY_MS) {
    validTokens.delete(token);
    return res.status(403).send('Token expired.');
  }

  tokenData.used = true;
  res.redirect('/jukebox.html');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
