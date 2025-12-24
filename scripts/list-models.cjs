
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.+)/);

        if (!match) {
            console.error('API Key not found in .env');
            return;
        }

        const apiKey = match[1].trim();

        console.log("Using Key ending in:", apiKey.slice(-4));
        console.log("Fetching models...");

        // Use Fetch direct as fallback if SDK behaves strictly
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            const err = await response.text();
            console.error("API Error:", response.status, err);
            return;
        }

        const data = await response.json();

        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name}`);
                    console.log(`  Display: ${m.displayName}`);
                }
            });
        } else {
            console.error("No models found:", data);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

listModels();
