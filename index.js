const express = require('express');
const axios = require('axios');

const app = express();

app.get('/', async (req, res) => {
  try {
    const mirrors = [
      'https://nitter.ca',
      'https://nitter.poast.org',
      'https://nitter.privacydev.net'
    ];

    let html = '';
    for (const mirror of mirrors) {
      try {
        const response = await axios.get(`${mirror}/launchcoin`, {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        html = response.data;
        break;
      } catch (err) {
        console.warn(`Mirror failed: ${mirror}`);
      }
    }

    if (!html) return res.status(500).json({ error: 'All Nitter mirrors failed' });

    const regex = /Your coin '([^']+)' .*?live!.*?(https:\/\/\S+)/gi;
    const launches = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      launches.push({ coin: match[1], link: match[2] });
    }

    res.json({ launches });
  } catch (err) {
    res.status(500).json({ error: 'Scraping failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
