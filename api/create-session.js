export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, orderId } = req.body;

  const response = await fetch("https://your-bank-mpgs-url/api/nvp/version/61", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from("MERCHANT_ID.OPERATOR_ID:PASSWORD").toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      apiOperation: "CREATE_CHECKOUT_SESSION",
      interaction_operation: "PURCHASE",
      order_id: orderId,
      order_currency: "USD",
      order_amount: amount
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}
