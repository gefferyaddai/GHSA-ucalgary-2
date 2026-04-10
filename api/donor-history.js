// /api/donor-history.js
// Vercel Serverless Function — fetches payment history + subscriptions for a donor
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

        // Find customer by email
        const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });

        if (customers.data.length === 0) {
            return res.status(200).json({
                customer: null,
                payments: [],
                subscriptions: [],
                totalDonated: 0,
            });
        }

        const customer = customers.data[0];

        // Fetch payment intents (one-time donations)
        const charges = await stripe.charges.list({
            customer: customer.id,
            limit: 50,
        });

        // Fetch subscriptions (recurring)
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'all',
            limit: 10,
        });

        // Fetch invoices (for subscription payments)
        const invoices = await stripe.invoices.list({
            customer: customer.id,
            limit: 50,
        });

        // Build payment history
        const payments = charges.data.map(charge => ({
            id: charge.id,
            amount: charge.amount,
            currency: charge.currency,
            status: charge.status,
            date: charge.created,
            description: charge.description || 'GHSA Sponsorship',
            receipt_url: charge.receipt_url,
            type: charge.invoice ? 'subscription' : 'one-time',
        }));

        // Build subscription info
        const subs = subscriptions.data.map(sub => ({
            id: sub.id,
            status: sub.status,
            amount: sub.items.data[0]?.price?.unit_amount || 0,
            currency: sub.items.data[0]?.price?.currency || 'cad',
            interval: sub.items.data[0]?.price?.recurring?.interval || 'month',
            current_period_end: sub.current_period_end,
            cancel_at_period_end: sub.cancel_at_period_end,
            created: sub.created,
        }));

        // Calculate total donated
        const totalDonated = payments
            .filter(p => p.status === 'succeeded')
            .reduce((sum, p) => sum + p.amount, 0);

        return res.status(200).json({
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
            },
            payments,
            subscriptions: subs,
            totalDonated,
        });

    } catch (err) {
        console.error('Donor history error:', err);
        return res.status(500).json({ error: err.message });
    }
};