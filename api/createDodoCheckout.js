import DodoPayments from 'dodopayments';

export default async function handler(req, res) {
    // Allow CORS
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { amount, currency = 'USD', planName, durationMonths, uid } = req.body;

    // We map durations to product IDs you should create in Dodo Payments
    // Replace these placeholder IDs with the actual Product IDs from your dashboard
    const productMapping = {
        1: 'pdt_0NdS1kcWQYi0ZDWafzmi8',
        3: 'pdt_0NdS1kpibztnu8fS1nX3d',
        12: 'pdt_0NdS1kt8sRFuf4PeNjoba'
    };

    const productId = productMapping[durationMonths];

    try {
        const client = new DodoPayments({
            bearerToken: process.env.DODO_PAYMENTS_API_KEY,
            environment: process.env.NODE_ENV === 'production' ? 'live_mode' : 'test_mode',
        });

        const baseUrl = req.headers.origin || 'http://localhost:5173';
        const returnUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(planName)}&duration=${durationMonths}`;

        const session = await client.checkoutSessions.create({
            billing: {
                city: "",
                country: "",
                state: "",
                street: "",
                zipcode: ""
            },
            product_cart: [
                {
                    product_id: productId,
                    quantity: 1,
                    // Note: If you enable "Pay What You Want" in Dodo, you can pass the dynamic amount here:
                    // amount: amount * 100, // amount in cents
                }
            ],
            return_url: returnUrl,
            metadata: {
                uid: uid,
                plan: planName
            }
        });

        res.status(200).json({ checkout_url: session.checkout_url });
    } catch (error) {
        console.error('Error creating Dodo Payments order:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
