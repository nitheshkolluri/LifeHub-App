
import dotenv from "dotenv";
import path from "path";
import https from "https";

// Load env from one level up (backend root)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const key = process.env.GEMINI_API_KEY;
if (!key) {
    console.error("❌ No API Key found in .env");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log("Fetching available models from:", url.replace(key, "HIDDEN_KEY"));

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", json.error);
            } else if (json.models) {
                console.log("\n✅ AVAILABLE MODELS:");
                json.models.forEach((m: any) => {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                        console.log(`- ${m.name} (DisplayName: ${m.displayName})`);
                    }
                });
            } else {
                console.log("Unknown response:", json);
            }
        } catch (e) {
            console.error("Parse Error:", e);
            console.log("Raw Data:", data);
        }
    });
}).on('error', (e) => {
    console.error("Request Error:", e);
});
