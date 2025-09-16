// /api/check-order.js — verify order status after Hosted Checkout
export default async function handler(req, res) {
  try {
    const { orderId } = req.query || {};
    if (!orderId) return res.status(400).json({ error: "Missing orderId" });

    const MERCHANT_ID  = process.env.MPGS_MERCHANT_ID;
    const API_PASSWORD = process.env.MPGS_API_PASSWORD;
    const GATEWAY_BASE = process.env.MPGS_BASE;                 // e.g. https://ap-gateway.mastercard.com
    const API_VERSION  = process.env.MPGS_API_VERSION || "100";

    const auth = Buffer.from(`merchant.${MERCHANT_ID}:${API_PASSWORD}`).toString("base64");
    const url  = `${GATEWAY_BASE}/api/rest/version/${API_VERSION}/merchant/${MERCHANT_ID}/order/${encodeURIComponent(orderId)}`;

    const resp = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
}
