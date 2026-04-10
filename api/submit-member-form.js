// /api/submit-member-form.js
// Vercel Serverless Function — receives member/exec applications and emails them to GHSA
const nodemailer = require('nodemailer');

const ALLOWED_ORIGIN = process.env.SITE_URL || 'https://ghsa.ca';

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const {
            firstName, lastName, email, school,
            major, year, joinMember, joinExec, execTeams, bio,
        } = req.body;

        // Basic server-side validation
        if (!firstName || !lastName || !email || !school || !major || !year) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        if (!joinMember && !joinExec) {
            return res.status(400).json({ error: 'Must select member or exec option.' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const roles = [];
        if (joinMember) roles.push('General Member');
        if (joinExec)   roles.push('Exec Team');

        const execSection = joinExec
            ? `
<h3>Exec Application Details</h3>
<p><strong>Teams of Interest:</strong> ${(execTeams || []).join(', ') || 'None specified'}</p>
<p><strong>Bio / About Them:</strong></p>
<blockquote>${bio || '—'}</blockquote>`
            : '';

        const html = `
<h2>New Membership Application — GHSA UCalgary</h2>
<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
  <tr><td><strong>Name</strong></td><td>${firstName} ${lastName}</td></tr>
  <tr><td><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
  <tr><td><strong>School / Faculty</strong></td><td>${school}</td></tr>
  <tr><td><strong>Major / Program</strong></td><td>${major}</td></tr>
  <tr><td><strong>Year</strong></td><td>${year}</td></tr>
  <tr><td><strong>Applying For</strong></td><td>${roles.join(', ')}</td></tr>
</table>
${execSection}`;

        await transporter.sendMail({
            from: `"GHSA Website" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            replyTo: email,
            subject: `New Member Application — ${firstName} ${lastName}`,
            html,
        });

        return res.status(200).json({ ok: true });

    } catch (err) {
        console.error('Member form error:', err);
        return res.status(500).json({ error: 'Failed to send application. Please try again.' });
    }
};