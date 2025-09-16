// /api/create-session.js  — MPGS Hosted Checkout (REST)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Values your frontend will send (or you can hardcode defaults)
    const { amount, currency, orderId, description, aff } = req.body || {};

    // Secure config from Vercel → Project → Settings → Environment Variables
    const MERCHANT_ID  = process.env.MPGS_MERCHANT_ID;          // e.g. "TESTMERCHANT123"
    const API_PASSWORD = process.env.MPGS_API_PASSWORD;         // API password (NOT operator login)
    const GATEWAY_BASE = process.env.MPGS_BASE;                  // e.g. "https://ap-gateway.mastercard.com"
    const API_VERSION  = process.env.MPGS_API_VERSION || '100';  // MPGS REST version
    const PUBLIC_BASE  = process.env.PUBLIC_BASE_URL;            // e.g. "https://yourapp.vercel.app"
    const PUBLIC_JOIN  = process.env.PUBLIC_JOIN_URL || '';      // optional Skool join link

    if (!MERCHANT_ID || !API_PASSWORD || !GATEWAY_BASE || !PUBLIC_BASE) {
      return res.status(400).json({ error: 'Missing required environment variables' });
    }

    // Build order values (USD for Somalia, by your plan)
    const ordId = orderId || `ORD-${Date.now()}`;
    const amt   = Number(amount ?? 49).toFixed(2);
    const curr  = (currency || 'USD').toUpperCase();
    const desc  = description || 'Order';

    // MPGS endpoint per docs:
    // POST {GATEWAY_BASE}/api/rest/version/{API_VERSION}/merchant/{MERCHANT_ID}/session
    const createUrl = `${GATEWAY_BASE}/api/rest/version/${API_VERSION}/merchant/${MERCHANT_ID}/session`;

    // Basic auth is "merchant.{merchantId}:{apiPassword}"
    const auth = Buffer.from(`merchant.${MERCHANT_ID}:${API_PASSWORD}`).toString('base64');

    // Return & cancel URLs shown in the docs (we also pass orderId & optional affiliate tag)
    const params = new URLSearchParams({ orderId: ordId });
    if (aff) params.set('aff', String(aff));
    if (PUBLIC_JOIN) params.set('join', PUBLIC_JOIN);

    const returnUrl = `${PUBLIC_BASE}/return?${params.toString()}`;
    const cancelUrl = `${PUBLIC_BASE}/cancel?${params.toString()}`;

    // Request body per “CREATE_CHECKOUT_SESSION”
    const body = {
      apiOperation: 'CREATE_CHECKOUT_SESSION',
      order: {
        id: ordId,
        amount: amt,
        currency: curr,
        description: desc
      },
      interaction: {
        operation: 'PURCHASE',
        returnUrl,
        cancelUrl
      }
    };

    const resp = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json();

    if (!resp.ok) {
      // Pass through MPGS error details for easier debugging
      return res.status(resp.status).json({ error: data });
    }

    // Success → send session back to the frontend
    return res.status(200).json({
      sessionId: data?.session?.id,
      merchant: MERCHANT_ID,
      orderId: ordId,
      amount: amt,
      currency: curr
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server_error' });
  }
}
