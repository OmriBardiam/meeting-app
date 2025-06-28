#!/usr/bin/env node

const https = require('https');

const railwayUrls = [
  'https://34dcc856-e079-4a62-b5bf-cbc59c500ff0.up.railway.app',
  'https://drunksters-backend-production.up.railway.app',
  'https://meeting-game-backend-production.up.railway.app',
  'https://drunksters-backend.up.railway.app',
  'https://meeting-game-backend.up.railway.app'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ url, status: res.statusCode, data: json, working: true });
        } catch (e) {
          resolve({ url, status: res.statusCode, data: data.substring(0, 100), working: false });
        }
      });
    });
    
    req.on('error', (err) => {
      resolve({ url, error: err.message, working: false });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ url, error: 'Timeout', working: false });
    });
  });
}

async function main() {
  console.log('🔍 Checking Railway backend URLs...\n');
  
  for (const url of railwayUrls) {
    console.log(`Testing: ${url}`);
    const result = await checkUrl(url);
    
    if (result.working) {
      console.log(`✅ WORKING - Status: ${result.status}`);
      console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
    } else {
      console.log(`❌ FAILED - ${result.error || result.status}`);
    }
    console.log('');
  }
  
  console.log('📋 Next steps:');
  console.log('1. If none of the URLs work, check your Railway dashboard');
  console.log('2. Make sure the service is deployed and running');
  console.log('3. Update the RAILWAY_SERVICE secret in GitHub if needed');
  console.log('4. Check the GitHub Actions logs for deployment errors');
}

main().catch(console.error); 