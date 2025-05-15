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
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        });
        html = response.data;
        break;
      } catch (err) {
        console.warn(`⚠️ Failed on mirror ${mirror}:`, err.message);
      }
    }

    if (!html) {
      return res.status(500).json({ error: 'All Nitter mirrors failed' });
    }

    // Match tweets like: "Your coin 'No Grande' is live! Link: https://believe.app/coin/..."
    const coinLaunchRegex = /Your coin '([^']+)' .*?live!.*?(https:\/\/\S+)/gi;

    const launches = [];
    let match;
    while ((match = coinLaunchRegex.exec(html)) !== null) {
      launches.push({
        coin: match[1],
        link: match[2]
      });
    }

    res.json({ launches });
  } catch (err) {
    console.error('❌ Scraping error:', err.message);
    res.status(500).json({ error: 'Failed to scrape Launchcoin replies' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Scraper running on http://localhost:${PORT}`);
});
