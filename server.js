const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Token Store
const validTokens = new Map([
  ['abc1234', { used: false, createdAt: Date.now() }]
]);

// Session Store (keyed by sessionId)
const sessions = new Map();

const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_EXPIRY_MS = 3 * 60 * 1000; // shorter-lived sessions

// Serve only songs.json publicly
app.use('/songs.json', express.static(path.join(__dirname, 'public/songs.json')));

// Homepage
app.get('/', (req, res) => {
  res.send('<h2>QR Code Verifier</h2><p>Use /verify?token=XYZ</p>');
});

// Token verification
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

  // Mark token as used
  tokenData.used = true;

  // Generate a session key
  const sessionId = Math.random().toString(36).substring(2, 12);
  sessions.set(sessionId, Date.now());

  // Redirect to protected jukebox page
  res.redirect(`/jukebox?session=${sessionId}`);
});

// Protected jukebox page
app.get('/jukebox', (req, res) => {
  const sessionId = req.query.session;

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(403).send('Access denied.');
  }

  // Check session expiry
  const createdAt = sessions.get(sessionId);
  if (Date.now() - createdAt > SESSION_EXPIRY_MS) {
    sessions.delete(sessionId);
    return res.status(403).send('Session expired.');
  }

  // Extend session life or use one-time removal if needed
  res.sendFile(path.join(__dirname, 'views', 'jukebox.html'));
});

// Prevent direct access to jukebox.html via static route
app.use('/jukebox.html', (req, res) => {
  res.status(403).send('Direct access forbidden.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
