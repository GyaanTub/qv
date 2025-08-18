// Jai Shree Krishna

const express = require('express');
const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const app = express();
const PORT = 3000;

// Please ensure this is set correctly
const ALLOWED_HOSTS = ['http://localhost:3000', 'https://quantvidya.vercel.app'];

function blockDirectAccess(req, res, next) {
  const referer = req.get('Referer');
  // console.log('Referer:', referer);  // Log the referer for debugging
  
  // Check if referer starts with any of the allowed hosts
  const isValidReferer = ALLOWED_HOSTS.some(host => referer && referer.startsWith(host));

  if (!isValidReferer) {
    return res.status(403).send('Direct access not allowed.');
  }
  
  next();
}

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/correlation', (req, res) => {
  res.sendFile(path.join(__dirname, 'premium', 'COR', 'index.html'));
});

app.get('/scatter', (req, res) => {
  res.sendFile(path.join(__dirname, 'premium', 'SD', 'index.html'));
});

app.get('/seac', (req, res) => {
  res.sendFile(path.join(__dirname, 'premium', 'SEAC', 'index.html'));
});

app.get('/monthly', (req, res) => {
  res.sendFile(path.join(__dirname, 'premium', 'MV', 'index.html'));
});

app.get('/monthperchange', (req, res) => {
  res.sendFile(path.join(__dirname, 'premium', 'MPC', 'index.html'));
});

app.get('/ms12', (req, res) => {
  res.sendFile(path.join(__dirname, 'premium', '12MS', 'index.html'));
});

app.get('/rrg', (req, res) => {
  res.sendFile(path.join(__dirname, 'premium', 'RRG', 'index.html'));
});

app.get('/suggest', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'suggest.html'));
});

app.get('/wip', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chart.html'));
});

app.use('/scripts', blockDirectAccess, express.static(path.join(__dirname, 'js')));

// Serve 'index.html' on the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});