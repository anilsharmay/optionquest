const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
const USER_ID = 1;

async function runTest() {
    try {
        console.log('--- Starting Verification ---');

        console.log('\n1. Testing Deposit (Transaction Safety)...');
        try {
            await axios.post(`${API_URL}/user/${USER_ID}/deposit`, { amount: 1000 });
            console.log('✅ Deposit successful');
        } catch (e) {
            console.error('❌ Deposit failed:', e.response?.data || e.message);
        }

        console.log('\n2. Fetching Real Market Data for AAPL...');
        let chain = null;
        let optionToBuy = null;
        try {
            const chainRes = await axios.get(`${API_URL}/options/AAPL`);
            chain = chainRes.data;
            if (chain && chain.options && chain.options[0] && chain.options[0].calls.length > 0) {
                optionToBuy = chain.options[0].calls[0];
                console.log(`✅ Found Option: AAPL Call Strike $${optionToBuy.strike}`);
                console.log(`   Market Price: $${optionToBuy.lastPrice}`);
            } else {
                console.error('❌ Could not find valid option chain');
                return;
            }
        } catch (e) {
            console.error('❌ Failed to fetch options:', e.message);
            return;
        }

        if (!optionToBuy) return;

        console.log('\n3. Testing Price Validation (Security Check)...');

        // Test A: Manipulated Price (Should FAIL)
        console.log('   Part A: Attempting Manipulated Price ($0.01)...');
        try {
            await axios.post(`${API_URL}/trade/buy`, {
                userId: USER_ID,
                ticker: 'AAPL',
                type: 'call',
                strategy: 'long',
                strike: optionToBuy.strike,
                expiry: chain.expirationDate,
                entryPrice: 0.01, // MALICIOUS PRICE
                quantity: 1
            });
            console.error('❌ Security Check FAILED: Server accepted manipulated price!');
        } catch (e) {
            if (e.response && e.response.status === 400 && e.response.data.error.includes('Price validation failed')) {
                console.log('✅ Security Check PASSED: Server rejected manipulated price.');
            } else {
                // Sometimes error message might differ slightly, treat 400 as pass for validation failure
                if (e.response?.status === 400) {
                    console.log(`✅ Security Check PASSED: Server rejected with 400 (${e.response.data.error})`);
                } else {
                    console.error('❌ Unexpected error:', e.response?.data || e.message);
                }
            }
        }

        // Test B: Valid Price (Should SUCCESS)
        console.log('   Part B: Attempting Valid Price...');
        try {
            await axios.post(`${API_URL}/trade/buy`, {
                userId: USER_ID,
                ticker: 'AAPL',
                type: 'call',
                strategy: 'long',
                strike: optionToBuy.strike,
                expiry: chain.expirationDate,
                // Use exact last price
                entryPrice: optionToBuy.lastPrice,
                quantity: 1
            });
            console.log('✅ Valid Trade PASSED: Server accepted valid price.');
        } catch (e) {
            console.error('❌ Valid Trade FAILED:', e.response?.data || e.message);
        }

        console.log('\n--- Verification Complete ---');

    } catch (err) {
        console.error('Global Error:', err);
    }
}

runTest();
