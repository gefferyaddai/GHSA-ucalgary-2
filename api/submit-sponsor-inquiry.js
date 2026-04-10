// /api/submit-sponsor-inquiry.js
// Vercel Serverless Function — receives sponsor inquiries and emails them to GHSA
const nodemailer = require('nodemailer');

const ALLOWED_ORIGIN = process.env.SITE_URL || 'https://ghsa.ca';

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { firstName, lastName, email, package: pkg, message } = req.body;

        if (!firstName || !lastName || !email || !pkg) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        if (message && message.length > 5000) {
            return res.status(400).json({ error: 'Message too long (max 5000 characters).' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const html = `
<h2>New Sponsor Inquiry — GHSA UCalgary</h2>
<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
  <tr><td><strong>Name</strong></td><td>${escapeHtml(firstName)} ${escapeHtml(lastName)}</td></tr>
  <tr><td><strong>Email</strong></td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
  <tr><td><strong>Package Interest</strong></td><td>${escapeHtml(pkg)}</td></tr>
</table>
<h3>Message</h3>
<blockquote>${escapeHtml(message) || '(No message provided)'}</blockquote>`;

        await transporter.sendMail({
            from: `"GHSA Website" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            replyTo: email,
            subject: `New Sponsor Inquiry — ${firstName} ${lastName} (${pkg})`,
            html,
        });

        return res.status(200).json({ ok: true });

    } catch (err) {
        console.error('Sponsor inquiry error:', err);
        return res.status(500).json({ error: 'Failed to send inquiry. Please try again.' });
    }
};