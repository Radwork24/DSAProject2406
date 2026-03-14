import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
