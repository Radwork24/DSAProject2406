import Groq from 'groq-sdk';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { text, voice = 'troy' } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }

        const groq = new Groq({
            apiKey: process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY,
        });

        const response = await groq.audio.speech.create({
            model: 'canopylabs/orpheus-v1-english',
            voice: voice,
            input: text,
            response_format: 'wav',
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Length', buffer.length);
        res.status(200).end(buffer);
    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500).json({ error: error.message });
    }
}
