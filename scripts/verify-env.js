const path = require('path');
const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
require('dotenv').config({ path: `${targetDir}/.env` });

const fs = require('fs');
const { execSync } = require('child_process');

console.log('--- Verifying Environment Setup ---');

// 1. Check .env exists
if (!fs.existsSync(`${targetDir}/.env`)) {
    console.error('❌ ERROR: .env file not found. Copy .env.example to .env and fill it out.');
    process.exit(1);
}
console.log('✅ .env file found.');

// 2. Check required keys from .env.example
const example = fs.readFileSync(`${targetDir}/.env.example`, 'utf8');
const requiredKeys = example
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=')[0].trim())
    .filter(Boolean);

let allOk = true;

console.log('Verifying required keys are set in .env...');
const envContent = fs.readFileSync(`${targetDir}/.env`, 'utf8');
for (const key of requiredKeys) {
    const regex = new RegExp(`^${key}=.+`, 'm');
    if (regex.test(envContent)) {
        console.log(`  ✅ FOUND: ${key}`);
    } else {
        console.log(`  ❌ MISSING: ${key}`);
        allOk = false;
    }
}

// 3. Test Tavily API connectivity
console.log('Testing Tavily API connectivity...');
const tavilyKey = process.env.TAVILY_API_KEY;

if (!tavilyKey) {
    console.log('  ❌ FAILED: TAVILY_API_KEY not set. Cannot test connection.');
    allOk = false;
} else {
    try {
        const result = execSync(
            `curl -s -X POST https://api.tavily.com/search \
              -H "Content-Type: application/json" \
              -d '{"api_key":"${tavilyKey}","query":"test"}'`
        ).toString();
        if (result.includes('"error"')) {
            console.log('  ❌ FAILED: Tavily API returned an error.');
            allOk = false;
        } else {
            console.log('  ✅ SUCCESS: Tavily API connection working.');
        }
    } catch (e) {
        console.log(`  ❌ FAILED: curl error — ${e.message}`);
        allOk = false;
    }
}

// 4. Summary
console.log('-------------------------------------');
if (allOk) {
    console.log('✅ All environment checks passed.');
} else {
    console.error('❌ Some checks failed. Review errors above.');
    process.exit(1);
}