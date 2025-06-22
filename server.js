// server.js

const express = require('express');
const app = express();
const port = 3000;

// Example: mock token store (in production, use a database)
const validTokens = new Map([
  ['abc123', { used: false, createdAt: Date.now() }],
  ['def456', { used: false, createdAt: Date.now() }],
]);

// Token validity duration (e.g., 5 minutes)
const TOKEN_EXPIRY_MS = 5 * 60 * 1000;

app.get('/verify', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('Missing token.');
  }

  const tokenEntry = validTokens.get(token);

  if (!tokenEntry) {
    return res.status(401).send('Invalid token.');
  }

  // Check if token is expired
  const isExpired = Date.now() - tokenEntry.createdAt > TOKEN_EXPIRY_MS;
  if (isExpired) {
    validTokens.delete(token); // Optionally remove expired token
    return res.status(403).send('Token expired.');
  }

  // Check if token has already been used
  if (tokenEntry.used) {
    return res.status(403).send('Token already used.');
  }

  // Mark as used
  tokenEntry.used = true;

  // Success
  return res.send(`<h1>✅ Access Verified</h1><p>Your token was accepted.</p>`);
});

app.listen(port, () => {
  console.log(`Token verification server running at http://localhost:${port}`);
});
