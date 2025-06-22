const express = require('express');
const app = express();

// Heroku dynamically sets the port via process.env.PORT
const PORT = process.env.PORT || 3000;

// In-memory token store (replace with Redis or DB for production)
const validTokens = new Map([
  ['abc123', { used: false, createdAt: Date.now() }],
  ['def456', { used: false, createdAt: Date.now() }]
]);

const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

app.get('/', (req, res) => {
  res.send('<h2>QR Code Token Verifier</h2><p>Append <code>?token=YOUR_TOKEN</code> to /verify</p>');
});

app.get('/verify', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('Missing token.');
  }

  const tokenEntry = validTokens.get(token);

  if (!tokenEntry) {
    return res.status(401).send('Invalid token.');
  }

  if (Date.now() - tokenEntry.createdAt > TOKEN_EXPIRY_MS) {
    validTokens.delete(token);
    return res.status(403).send('Token expired.');
  }

  if (tokenEntry.used) {
    return res.status(403).send('Token already used.');
  }

  tokenEntry.used = true;

  return res.send(`<h1>✅ Access Verified</h1><p>Your token <code>${token}</code> is valid.</p>`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
