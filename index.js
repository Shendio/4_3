'use strict';

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const dataPath = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function saveData() {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// lista kategorii
app.get('/jokebook/categories', (req, res) => {
    res.json({ categories: data.categories });
});

// losowy żart z kategorii
app.get('/jokebook/joke/:category', (req, res) => {
  const category = req.params.category;
  const jokes = data[category];

  if (!jokes || !Array.isArray(jokes) || jokes.length === 0) {
    return res.json({ error: `no jokes for category ${category}` });
  }

  const index = Math.floor(Math.random() * jokes.length);
  res.json(jokes[index]);
});

// wszystkie żarty z danej kategorii
app.get('/jokebook/jokes/:category', (req, res) => {
  const category = req.params.category;
  const jokes = data[category];

  if (!jokes || !Array.isArray(jokes)) {
    return res.json({ error: `no jokes for category ${category}` });
  }

  res.json(jokes);
});

// dodawanie nowego żartu do kategorii
app.post('/jokebook/joke/:category', (req, res) => {
  const category = req.params.category;
  const jokes = data[category];

  if (!jokes || !Array.isArray(jokes)) {
    return res.json({ error: `no jokes for category ${category}` });
  }

  const { joke, response } = req.body;

  if (!joke || !response) {
    return res.json({ error: 'joke and response are required' });
  }

  jokes.push({ joke, response });
  saveData();

  res.json({ success: true, message: `Joke added to ${category}`, joke: { joke, response } });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
