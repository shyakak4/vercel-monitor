const axios = require('axios');
const axiosRetry = require('axios-retry').default;
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

// Configure axios with retries for unstable network
axiosRetry(axios, { 
    retries: 5, 
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNABORTED';
    }
});

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
const LINEAR_API_KEY = process.env.LINEAR_API_KEY;

async function testVercel() {
    console.log('--- Testing Vercel API ---');
    try {
        const res = await axios.get(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}`, {
            headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
            timeout: 10000
        });
        console.log('✅ Vercel Token & Project ID are VALID.');
        console.log(`Project Name: ${res.data.name}`);
    } catch (err) {
        console.error('❌ Vercel Test FAILED:');
        if (err.response) {
            console.error(`Status: ${err.response.status}`);
            console.error(`Data: ${JSON.stringify(err.response.data)}`);
        } else {
            console.error(err.message);
        }
    }
}

async function testLinear() {
    console.log('\n--- Testing Linear API ---');
    try {
        const res = await axios.post('https://api.linear.app/graphql', {
            query: '{ viewer { id name email } }'
        }, {
            headers: { 
                'Authorization': LINEAR_API_KEY,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        
        if (res.data.errors) {
            console.error('❌ Linear GraphQL Errors:');
            console.error(JSON.stringify(res.data.errors, null, 2));
        } else {
            console.log('✅ Linear API Key is VALID.');
            console.log(`User: ${res.data.data.viewer.name} (${res.data.data.viewer.email})`);
        }
    } catch (err) {
        console.error('❌ Linear Test FAILED:');
        if (err.response) {
            console.error(`Status: ${err.response.status}`);
            console.error(`Data: ${JSON.stringify(err.response.data)}`);
        } else {
            console.error(err.message);
        }
    }
}

async function runTests() {
    if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID || !LINEAR_API_KEY) {
        console.error('Missing required environment variables.');
        return;
    }
    await testVercel();
    await testLinear();
}

runTests();
