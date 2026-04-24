import Groq from 'groq-sdk';

export const config = {
    api: {
        bodyParser: false, // We need raw body for file upload
    },
};

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
        // Read raw body
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Parse multipart form data manually
        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(.+)/);
        if (!boundaryMatch) {
            return res.status(400).json({ error: 'Missing multipart boundary' });
        }

        const boundary = boundaryMatch[1];
        const parts = parseMultipart(buffer, boundary);

        const audioPart = parts.find(p => p.name === 'file');
        const languagePart = parts.find(p => p.name === 'language');

        if (!audioPart) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const groq = new Groq({
            apiKey: process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY,
        });

        // Create a File object from the buffer for the Groq SDK
        const audioFile = new File(
            [audioPart.data],
            audioPart.filename || 'audio.webm',
            { type: audioPart.contentType || 'audio/webm' }
        );

        const transcription = await groq.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-large-v3-turbo',
            language: languagePart?.data?.toString() || 'en',
            response_format: 'json',
            temperature: 0.0,
        });

        res.status(200).json({ text: transcription.text });
    } catch (error) {
        console.error('STT Error:', error);
        res.status(500).json({ error: error.message });
    }
}

/**
 * Simple multipart form data parser
 */
function parseMultipart(buffer, boundary) {
    const parts = [];
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const endBoundary = Buffer.from(`--${boundary}--`);

    let start = buffer.indexOf(boundaryBuffer) + boundaryBuffer.length;

    while (start < buffer.length) {
        // Find the next boundary
        let end = buffer.indexOf(boundaryBuffer, start);
        if (end === -1) break;

        // Extract the part between boundaries
        const part = buffer.slice(start, end);

        // Find the header/body separator (double CRLF)
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) {
            start = end + boundaryBuffer.length;
            continue;
        }

        const headers = part.slice(0, headerEnd).toString();
        // Body is between headers and the trailing \r\n before next boundary
        const body = part.slice(headerEnd + 4, part.length - 2); // -2 for trailing \r\n

        // Parse Content-Disposition
        const nameMatch = headers.match(/name="([^"]+)"/);
        const filenameMatch = headers.match(/filename="([^"]+)"/);
        const ctMatch = headers.match(/Content-Type:\s*(.+)/i);

        if (nameMatch) {
            parts.push({
                name: nameMatch[1],
                filename: filenameMatch?.[1],
                contentType: ctMatch?.[1]?.trim(),
                data: body,
            });
        }

        start = end + boundaryBuffer.length;
    }

    return parts;
}
