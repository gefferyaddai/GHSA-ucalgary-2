// /api/create-checkout-session.js
// Vercel Serverless Function — creates a Stripe Checkout session
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { amount, currency = 'cad', frequency = 'one-time', donorEmail } = req.body;

        if (!amount || amount < 100) {
            return res.status(400).json({ error: 'Amount must be at least $1 (100 cents).' });
        }

        // Base URL for redirects
        const baseUrl = process.env.SITE_URL || 'https://ghsa.vercel.app';

        if (frequency === 'monthly') {
            // ── RECURRING (subscription) ─────────────────────
            // Create a Price on the fly for the custom amount
            const price = await stripe.prices.create({
                unit_amount: amount,
                currency,
                recurring: { interval: 'month' },
                product_data: {
                    name: 'GHSA Monthly Sponsorship',
                    description: `$${(amount / 100).toFixed(2)} CAD/month — GHSA UCalgary`,
                },
            });

            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{ price: price.id, quantity: 1 }],
                customer_email: donorEmail || undefined,
                success_url: `${baseUrl}/pages/BecomeSponsor/SponsorAuth/sponsorAuth.html?session_id={CHECKOUT_SESSION_ID}&type=monthly`,
                cancel_url: `${baseUrl}/pages/BecomeSponsor/BecomeSponser.html?cancelled=true`,
                metadata: {
                    source: 'ghsa-website',
                    frequency: 'monthly',
                },
            });

            return res.status(200).json({ sessionId: session.id });

        } else {
            // ── ONE-TIME (payment) ───────────────────────────
            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency,
                        product_data: {
                            name: 'GHSA One-Time Sponsorship',
                            description: `$${(amount / 100).toFixed(2)} CAD — GHSA UCalgary`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                }],
                customer_email: donorEmail || undefined,
                success_url: `${baseUrl}/pages/BecomeSponsor/BecomeSponser.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/pages/BecomeSponsor/BecomeSponser.html?cancelled=true`,
                metadata: {
                    source: 'ghsa-website',
                    frequency: 'one-time',
                },
            });

            return res.status(200).json({ sessionId: session.id });
        }

    } catch (err) {
        console.error('Stripe Checkout error:', err);
        return res.status(500).json({ error: err.message });
    }
};