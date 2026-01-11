import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PM companies with their domains for Clearbit Logo API
const pmCompanies = [
  { name: 'Meta', domain: 'meta.com', filename: 'Meta.png' },
  { name: 'Google', domain: 'google.com', filename: 'Google.png' },
  { name: 'Amazon', domain: 'amazon.com', filename: 'Amazon.png' },
  { name: 'Microsoft', domain: 'microsoft.com', filename: 'Microsoft.png' },
  { name: 'Apple', domain: 'apple.com', filename: 'Apple.png' },
  { name: 'Uber', domain: 'uber.com', filename: 'Uber.png' },
  { name: 'Lyft', domain: 'lyft.com', filename: 'Lyft.png' },
  { name: 'Airbnb', domain: 'airbnb.com', filename: 'Airbnb.png' },
  { name: 'TikTok', domain: 'tiktok.com', filename: 'TikTok.png' },
  { name: 'Netflix', domain: 'netflix.com', filename: 'Netflix.png' },
  { name: 'Dropbox', domain: 'dropbox.com', filename: 'Dropbox.png' },
  { name: 'LinkedIn', domain: 'linkedin.com', filename: 'LinkedIn.png' },
  { name: 'DoorDash', domain: 'doordash.com', filename: 'DoorDash.png' },
  { name: 'Salesforce', domain: 'salesforce.com', filename: 'Salesforce.png' },
  { name: 'Coinbase', domain: 'coinbase.com', filename: 'Coinbase.png' },
  { name: 'Pinterest', domain: 'pinterest.com', filename: 'Pinterest.png' },
  { name: 'Twitter', domain: 'twitter.com', filename: 'Twitter.png' },
  { name: 'Yelp', domain: 'yelp.com', filename: 'Yelp.png' },
  { name: 'Adobe', domain: 'adobe.com', filename: 'Adobe.png' },
  { name: 'Intuit', domain: 'intuit.com', filename: 'Intuit.png' },
  { name: 'CapitalOne', domain: 'capitalone.com', filename: 'CapitalOne.png' },
  { name: 'Zoom', domain: 'zoom.us', filename: 'Zoom.png' },
  { name: 'Etsy', domain: 'etsy.com', filename: 'Etsy.png' },
  { name: 'eBay', domain: 'ebay.com', filename: 'eBay.png' },
  { name: 'Affirm', domain: 'affirm.com', filename: 'Affirm.png' },
  { name: 'Brex', domain: 'brex.com', filename: 'Brex.png' },
  { name: 'Roblox', domain: 'roblox.com', filename: 'Roblox.png' },
  { name: 'Glassdoor', domain: 'glassdoor.com', filename: 'Glassdoor.png' },
  { name: 'Quora', domain: 'quora.com', filename: 'Quora.png' },
  { name: 'Redfin', domain: 'redfin.com', filename: 'Redfin.png' },
];

const logosDir = path.join(__dirname, '..', 'public', 'logos');

// Ensure logos directory exists
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

function downloadLogo(company) {
  return new Promise((resolve, reject) => {
    const url = `https://logo.clearbit.com/${company.domain}?size=256`;
    const filePath = path.join(logosDir, company.filename);

    // Skip if already exists
    if (fs.existsSync(filePath)) {
      console.log(`✓ ${company.name} - already exists`);
      resolve({ name: company.name, status: 'exists' });
      return;
    }

    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ ${company.name} - downloaded`);
          resolve({ name: company.name, status: 'downloaded' });
        });
      } else {
        file.close();
        fs.unlinkSync(filePath); // Remove empty file
        console.log(`✗ ${company.name} - failed (${response.statusCode})`);
        resolve({ name: company.name, status: 'failed', code: response.statusCode });
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      console.log(`✗ ${company.name} - error: ${err.message}`);
      resolve({ name: company.name, status: 'error', message: err.message });
    });
  });
}

async function downloadAll() {
  console.log('Downloading PM company logos...\n');

  const results = [];
  for (const company of pmCompanies) {
    const result = await downloadLogo(company);
    results.push(result);
    // Small delay to be nice to the API
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n--- Summary ---');
  const downloaded = results.filter(r => r.status === 'downloaded').length;
  const existing = results.filter(r => r.status === 'exists').length;
  const failed = results.filter(r => r.status === 'failed' || r.status === 'error').length;

  console.log(`Downloaded: ${downloaded}`);
  console.log(`Already existed: ${existing}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed companies:');
    results.filter(r => r.status === 'failed' || r.status === 'error')
      .forEach(r => console.log(`  - ${r.name}`));
  }
}

downloadAll();
