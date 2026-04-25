import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Simple multipart form data parser for STT audio uploads
 */
function parseMultipartData(buffer, boundary) {
  const parts = [];
  const boundaryBuf = Buffer.from(`--${boundary}`);

  let start = buffer.indexOf(boundaryBuf) + boundaryBuf.length;

  while (start < buffer.length) {
    let end = buffer.indexOf(boundaryBuf, start);
    if (end === -1) break;

    const part = buffer.slice(start, end);
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) {
      start = end + boundaryBuf.length;
      continue;
    }

    const headers = part.slice(0, headerEnd).toString();
    const body = part.slice(headerEnd + 4, part.length - 2);

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

    start = end + boundaryBuf.length;
  }

  return parts;
}

/**
 * Run Python scraper and get context
 */

// Custom plugin to handle web search API using Python scraper
function runPythonScraper(question, mode = 'context') {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'scraper.py')

    const args = [scriptPath]
    if (mode === 'videos') {
      args.push('--videos')
    }
    args.push(question)

    const python = spawn('python3', args)

    let stdout = ''
    let stderr = ''

    python.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    python.stderr.on('data', (data) => {
      // Print Python logs to terminal
      process.stderr.write(data)
    })

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}`))
        return
      }

      try {
        const result = JSON.parse(stdout)
        resolve(result)
      } catch (e) {
        reject(new Error('Failed to parse Python output'))
      }
    })

    python.on('error', (err) => {
      reject(err)
    })
  })
}

// Custom plugin to handle web search API using Python scraper
function webSearchPlugin(env) {
  return {
    name: 'web-search-api',
    configureServer(server) {
      server.middlewares.use('/api/search', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const { question } = JSON.parse(body)

            console.log('\n' + '='.repeat(70))
            console.log('🐍 CALLING PYTHON SCRAPER (CONTEXT)')
            console.log('='.repeat(70))
            console.log('📝 Question:', question)
            console.log('-'.repeat(70))

            const result = await runPythonScraper(question, 'context')

            console.log('\n✅ Python scraper completed')
            console.log(`📊 Context length: ${result.context?.length || 0} characters`)
            console.log(`📚 Sources: ${result.sources?.length || 0} articles`)
            console.log('='.repeat(70) + '\n')

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              context: result.context || '',
              sources: result.sources || []
            }))
          } catch (error) {
            console.error('❌ Python scraper error:', error.message)
            res.statusCode = 500
            res.end(JSON.stringify({ error: error.message }))
          }
        })
      })

      server.middlewares.use('/api/videos', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            const { topic } = JSON.parse(body)

            console.log('\n' + '='.repeat(70))
            console.log('📹 CALLING PYTHON SCRAPER (VIDEOS)')
            console.log('='.repeat(70))
            console.log('📝 Topic:', topic)
            console.log('-'.repeat(70))

            const result = await runPythonScraper(topic, 'videos')

            console.log('\n✅ Python video search completed')
            console.log(`📊 Found: ${result.videos?.length || 0} videos`)
            console.log('='.repeat(70) + '\n')

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ videos: result.videos || [] }))
          } catch (error) {
            console.error('❌ Python scraper video error:', error.message)
            res.statusCode = 500
            res.end(JSON.stringify({ error: error.message }))
          }
        })
      })

      server.middlewares.use('/api/createOrder', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405; res.end('Method not allowed'); return;
        }
        let body = '';
        req.on('data', chunk => { body += chunk });
        req.on('end', async () => {
          try {
            const { amount, currency = 'INR', receipt } = JSON.parse(body);
            const razorpay = new Razorpay({
              key_id: env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
              key_secret: env.VITE_RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET,
            });
            const options = { amount: amount * 100, currency, receipt };
            const order = await razorpay.orders.create(options);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(order));
          } catch (error) {
            res.statusCode = 500; res.end(JSON.stringify({ error: error.message }));
          }
        });
      });

      server.middlewares.use('/api/verifyPayment', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405; res.end('Method not allowed'); return;
        }
        let body = '';
        req.on('data', chunk => { body += chunk });
        req.on('end', async () => {
          try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(body);
            const secret = env.VITE_RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
            const hmac = crypto.createHmac('sha256', secret);
            hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
            const generated_signature = hmac.digest('hex');
            res.setHeader('Content-Type', 'application/json');
            if (razorpay_signature === generated_signature) {
              res.end(JSON.stringify({ success: true, message: "Payment verified successfully" }));
            } else {
              res.statusCode = 400; res.end(JSON.stringify({ success: false, message: "Invalid payment signature" }));
            }
          } catch (error) {
            res.statusCode = 500; res.end(JSON.stringify({ error: error.message }));
          }
        });
      });

      server.middlewares.use('/api/createDodoCheckout', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405; res.end('Method not allowed'); return;
        }
        let body = '';
        req.on('data', chunk => { body += chunk });
        req.on('end', async () => {
          try {
            const { amount, currency = 'USD', planName, durationMonths, uid } = JSON.parse(body);
            
            const productMapping = {
                1: 'pdt_0NdS1kcWQYi0ZDWafzmi8',
                3: 'pdt_0NdS1kpibztnu8fS1nX3d',
                12: 'pdt_0NdS1kt8sRFuf4PeNjoba'
            };
            const productId = productMapping[durationMonths];

            const DodoPayments = (await import('dodopayments')).default;
            const client = new DodoPayments({
                bearerToken: env.DODO_PAYMENTS_API_KEY || process.env.DODO_PAYMENTS_API_KEY,
                environment: 'test_mode',
            });

            const baseUrl = req.headers.origin || 'http://localhost:5173';
            const returnUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(planName)}&duration=${durationMonths}`;

            const session = await client.checkoutSessions.create({
                billing: { city: "", country: "", state: "", street: "", zipcode: "" },
                product_cart: [{ product_id: productId, quantity: 1 }],
                return_url: returnUrl,
                metadata: { uid: uid, plan: planName }
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ checkout_url: session.checkout_url }));
          } catch (error) {
            res.statusCode = 500; res.end(JSON.stringify({ error: error.message }));
          }
        });
      });

      // ── Text-to-Speech (Groq PlayAI TTS) ──
      server.middlewares.use('/api/tts', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 200; res.end(); return;
        }
        if (req.method !== 'POST') {
          res.statusCode = 405; res.end('Method not allowed'); return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk });
        req.on('end', async () => {
          try {
            const { text, voice = 'troy' } = JSON.parse(body);
            if (!text) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'No text provided' }));
              return;
            }

            console.log('\n' + '='.repeat(70));
            console.log('🔊 GROQ TTS REQUEST');
            console.log('='.repeat(70));
            console.log('📝 Text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
            console.log('🎙️ Voice:', voice);
            console.log('-'.repeat(70));

            const Groq = (await import('groq-sdk')).default;
            // Try multiple key sources — .env.local takes priority over .env in Vite
            const apiKey = env.VITE_GROQ_API_KEY || env.VITE_HINT_API_KEY || process.env.GROQ_API_KEY;
            console.log('🔑 Using API key:', apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'MISSING');
            const groq = new Groq({ apiKey });

            const response = await groq.audio.speech.create({
              model: 'canopylabs/orpheus-v1-english',
              voice: voice,
              input: text,
              response_format: 'wav',
            });

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            console.log('✅ TTS audio generated:', buffer.length, 'bytes');
            console.log('='.repeat(70) + '\n');

            res.setHeader('Content-Type', 'audio/wav');
            res.setHeader('Content-Length', buffer.length);
            res.end(buffer);
          } catch (error) {
            console.error('❌ TTS Error:', error.message);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      });

      // ── Speech-to-Text (Groq Whisper) ──
      server.middlewares.use('/api/stt', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 200; res.end(); return;
        }
        if (req.method !== 'POST') {
          res.statusCode = 405; res.end('Method not allowed'); return;
        }

        // Collect raw body as buffer
        const chunks = [];
        req.on('data', chunk => { chunks.push(chunk) });
        req.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);

            console.log('\n' + '='.repeat(70));
            console.log('🎤 GROQ STT REQUEST');
            console.log('='.repeat(70));
            console.log('📦 Audio size:', buffer.length, 'bytes');
            console.log('-'.repeat(70));

            // Parse multipart form data
            const contentType = req.headers['content-type'] || '';
            const boundaryMatch = contentType.match(/boundary=(.+)/);
            if (!boundaryMatch) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Missing multipart boundary' }));
              return;
            }

            const boundary = boundaryMatch[1];
            const parts = parseMultipartData(buffer, boundary);
            const audioPart = parts.find(p => p.name === 'file');

            if (!audioPart) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No audio file found' }));
              return;
            }

            const Groq = (await import('groq-sdk')).default;
            const apiKey = env.VITE_GROQ_API_KEY || env.VITE_HINT_API_KEY || process.env.GROQ_API_KEY;
            console.log('🔑 Using API key:', apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'MISSING');
            const groq = new Groq({ apiKey });

            // Create a File object for the Groq SDK
            const audioFile = new File(
              [audioPart.data],
              audioPart.filename || 'audio.webm',
              { type: audioPart.contentType || 'audio/webm' }
            );

            const transcription = await groq.audio.transcriptions.create({
              file: audioFile,
              model: 'whisper-large-v3-turbo',
              language: 'en',
              response_format: 'json',
              temperature: 0.0,
            });

            console.log('✅ Transcription:', transcription.text);
            console.log('='.repeat(70) + '\n');

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ text: transcription.text }));
          } catch (error) {
            console.error('❌ STT Error:', error.message);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      });
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), webSearchPlugin(env)],
  };
})
