import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to read .env file manually since we aren't using 'dotenv' package
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                env[key.trim()] = value.trim();
            }
        });
        return env;
    } catch (e) {
        console.error("Could not read .env file");
        return {};
    }
}

const env = loadEnv();
const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = env.VITE_CLOUDINARY_UPLOAD_PRESET;

console.log("---------------------------------------------------");
console.log("Cloudinary Configuration Check");
console.log(`Cloud Name: ${cloudName}`);
console.log(`Upload Preset: ${uploadPreset}`);
console.log("---------------------------------------------------");

if (!cloudName || !uploadPreset) {
    console.error("❌ Missing configuration in .env file.");
    process.exit(1);
}

const sampleImageUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg";

async function verifyUpload() {
    console.log("Attempting to upload sample image...");
    const formData = new FormData();
    formData.append("file", sampleImageUrl);
    formData.append("upload_preset", uploadPreset);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();

        if (response.ok) {
            console.log("✅ Upload Successful!");
            console.log("Secure URL:", data.secure_url);
            console.log("Public ID:", data.public_id);
        } else {
            console.error("❌ Upload Failed!");
            console.error("Error Message:", data.error?.message);
        }
    } catch (error) {
        console.error("❌ Network or Script Error:", error);
    }
}

verifyUpload();
