# MPGS Hosted Checkout (Vercel + Canva friendly)

This is a tiny starter you can deploy to Vercel without writing code.
It creates Mastercard Payment Gateway Services (MPGS) **Hosted Checkout** sessions and redirects buyers to the Hosted Payment Page (HPP).
You then verify the order on the **/return** page.

## What you get

- `/api/create-session` — serverless function to create a checkout session
- `/api/check-order` — serverless function to verify an order after return
- `/pay.html` — button that creates a session and redirects to MPGS Hosted Payment Page
- `/return.html` — verifies the order and shows a basic receipt
- `/cancel.html` — shows a cancelled message
- `vercel.json` — routes `/pay`, `/return`, `/cancel` to the corresponding static files

## 1) Deploy (no-code style)

1. Create a free account at https://vercel.com (Google login works).
2. Click **Add New… → Project → Import** and upload this folder (or connect a GitHub repo containing these files).
3. After the first build, go to **Settings → Environment Variables** and add:

   - `MPGS_MERCHANT_ID` = your merchant ID (from your acquirer/MPGS portal)
   - `MPGS_API_PASSWORD` = the API password from MPGS (NOT your login password)
   - `MPGS_BASE` = your regional base URL (e.g., `https://eu-gateway.mastercard.com` for EU;
                  use `https://ap-gateway.mastercard.com` or `https://na-gateway.mastercard.com` if applicable)
   - `MPGS_API_VERSION` = `100` (or what your acquirer specifies)
   - `PUBLIC_BASE_URL` = your Vercel domain (e.g., `https://your-project-name.vercel.app`)

   Set each variable for **Production** (and **Preview** if you like). Re-deploy.

4. Visit `https://YOURDOMAIN.vercel.app/pay` — it will create a session and redirect to the Hosted Payment Page.

5. In **Canva**, add a button → **Link** → paste `https://YOURDOMAIN.vercel.app/pay`.
   That’s it. The buyer pays on MPGS, then lands on your `/return` page.

## 2) Sandbox vs Production

Ask your acquirer for **sandbox** credentials if you want to test without real cards. Use the sandbox merchant, API password, and base URL they provide.
Keep “region + version” consistent across API and checkout.js.

## 3) Security / PCI

This flow uses MPGS Hosted Payment Page, so card data never touches your server.
Do not collect card numbers yourself. Always verify server-side on `/return` with `/api/check-order` before fulfilling.

## 4) Customizing amounts and currency

In `pay.html`, edit the `amount`, `currency`, and `description` defaults or pass them as URL params (e.g., `/pay?amount=49&currency=USD&desc=Planner`).
The order ID is auto-generated and must be unique per order.

## 5) Troubleshooting

- Mixed regions (e.g., `eu-gateway` in API but `ap-gateway` for checkout.js) will break the flow.
- Ensure `PUBLIC_BASE_URL` matches your deployed domain exactly (including `https://`). 
- If return or cancel doesn’t work, double-check you set `interaction.returnUrl` and `interaction.cancelUrl` in the session creation call.
