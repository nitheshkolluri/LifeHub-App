
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
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy model to get client

        // Actually, the SDK doesn't have a direct 'listModels' on the client instance in older versions? 
        // Or it might behave differently. 
        // Let's use the raw API fetch if SDK is ambiguous, but SDK is installed.
        // Checking SDK docs... SDK usually assumes you know the model.
        // Let's fallback to fetch for listing models.

        console.log("Fetching models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name} (${m.displayName})`);
                    console.log(`  Supported: ${m.supportedGenerationMethods.join(', ')}`);
                }
            });
        } else {
            console.error("No models found or error:", data);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

listModels();
