import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import Parser from 'rss-parser';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Shared state for latest news (in-memory for this example)
let latestNews: any[] = [];

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  
  app.use(express.json());

  // API Routes
  app.get('/api/news/pulse', async (req, res) => {
    res.json({ 
      status: "ok",
      news: latestNews,
      lastUpdated: new Date().toISOString()
    });
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const finalPort = process.env.PORT || port;
  app.listen(finalPort, '0.0.0.0', () => {
    console.log(`moecho server running at http://localhost:${finalPort}`);
  });
}

// News Fetcher
const parser = new Parser();

async function updateNewsItems() {
  console.log('--- moecho: Updating News Pulse ---');
  try {
    let newsItems = [];
    try {
      const wefFeed = await parser.parseURL('https://www.weforum.org/rss');
      newsItems = wefFeed.items.slice(0, 5).map(item => ({
        title: item.title,
        summary: item.contentSnippet,
        link: item.link,
        source: 'WEF',
        pubDate: item.pubDate
      }));
    } catch (e) {
      console.warn('RSS fetch failed, using fallback mock news.');
      newsItems = [
        { title: 'Global Energy Transition Intensifies', summary: 'Major shifts in renewable investment patterns detected.', source: 'WEF', pubDate: new Date().toISOString() },
        { title: 'AI Regulation Wave Hits APAC', summary: 'New frameworks for agentic AI being proposed across tech hubs.', source: 'Reuters', pubDate: new Date().toISOString() },
        { title: 'Supply Chain Diversification Accelerates', summary: 'Companies moving towards decentralized manufacturing models.', source: 'MarketPulse', pubDate: new Date().toISOString() },
        { title: 'Central Bank Digital Currencies Evolve', summary: 'Retail CBDC pilots showing promising results in pilot cities.', source: 'FinTechDaily', pubDate: new Date().toISOString() }
      ];
    }
    latestNews = newsItems;
    console.log('News Pulse updated successfully.');
  } catch (error) {
    console.error('Error updating news items:', error);
  }
}

// Initial run
updateNewsItems();

// Scheduled task: Every 6 hours
cron.schedule('0 */6 * * *', updateNewsItems);

startServer();
