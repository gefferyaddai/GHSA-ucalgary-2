// /api/create-portal-session.js
// Vercel Serverless Function — opens Stripe Customer Portal for managing subscriptions
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ALLOWED_ORIGIN = process.env.SITE_URL || 'https://ghsa.ca';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { customerEmail } = req.body;

        if (!customerEmail) {
            return res.status(400).json({ error: 'Customer email is required.' });
        }

        // Find the Stripe customer by email
        const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });

        if (customers.data.length === 0) {
            return res.status(404).json({ error: 'No Stripe customer found with this email.' });
        }

        const customer = customers.data[0];
        const baseUrl = process.env.SITE_URL || 'https://ghsa.ca';

        const session = await stripe.billingPortal.sessions.create({
            customer: customer.id,
            return_url: `${baseUrl}/pages/BecomeSponsor/SponsorDashboard/sponsorDashboard.html`,
        });

        return res.status(200).json({ url: session.url });

    } catch (err) {
        console.error('Portal session error:', err);
        return res.status(500).json({ error: err.message });
    }
};