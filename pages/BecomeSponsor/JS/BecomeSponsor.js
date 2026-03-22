/* ============================================================
   GHSA — Become a Sponsor Page JS
   ============================================================ */

// ── STRIPE CONFIG ────────────────────────────────────
// Replace with your actual Stripe publishable key
const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// ── FREQUENCY TOGGLE (One-time / Monthly) ────────────
let donationFrequency = 'one-time'; // 'one-time' | 'monthly'

document.querySelectorAll('.sp-freq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.sp-freq-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        donationFrequency = btn.dataset.freq;
        updateDonateLabel(selectedAmount);
    });
});

// ── AMOUNT SELECTOR ──────────────────────────────────
let selectedAmount = 10;

const amountBtns     = document.querySelectorAll('.sp-amount-btn');
const customWrap     = document.getElementById('customWrap');
const customInput    = document.getElementById('customAmount');
const donateBtnLabel = document.getElementById('donateBtnLabel');

function updateDonateLabel(amount) {
    const suffix = donationFrequency === 'monthly' ? '/mo' : '';
    donateBtnLabel.textContent = amount ? `Donate $${amount}${suffix}` : 'Enter an amount';
}

amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        amountBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        if (btn.dataset.amount === 'custom') {
            customWrap.classList.add('visible');
            selectedAmount = parseInt(customInput.value, 10) || null;
            updateDonateLabel(selectedAmount);
            customInput.focus();
        } else {
            customWrap.classList.remove('visible');
            selectedAmount = parseInt(btn.dataset.amount, 10);
            updateDonateLabel(selectedAmount);
        }
    });
});

customInput.addEventListener('input', () => {
    selectedAmount = parseInt(customInput.value, 10) || null;
    updateDonateLabel(selectedAmount);
});

// ── STRIPE CHECKOUT ──────────────────────────────────
document.getElementById('donateBtn').addEventListener('click', async () => {
    if (!selectedAmount || selectedAmount < 1) {
        customInput.focus();
        return;
    }

    const btn = document.getElementById('donateBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Redirecting...';

    try {
        // Your backend should create a Stripe Checkout session and return { sessionId }.
        // For monthly: use mode 'subscription' with a recurring Price object.
        // For one-time: use mode 'payment'.
        const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount:      selectedAmount * 100, // Stripe uses cents
                currency:    'cad',
                description: 'GHSA Individual Sponsorship',
                frequency:   donationFrequency,    // 'one-time' | 'monthly'
                mode:        donationFrequency === 'monthly' ? 'subscription' : 'payment',
            }),
        });

        const { sessionId } = await res.json();
        await stripe.redirectToCheckout({ sessionId });

    } catch (err) {
        console.error('Stripe error:', err);
        btn.disabled = false;
        const suffix = donationFrequency === 'monthly' ? '/mo' : '';
        btn.innerHTML = `<i class="fa-solid fa-heart"></i> <span id="donateBtnLabel">Donate $${selectedAmount}${suffix}</span>`;
        alert('Something went wrong. Please try again or contact us directly.');
    }
});

// ── TIER SELECT — AUTO-FILL FORM ─────────────────────
// Clicking "Select This Level" updates the dropdown and scrolls to the form
document.querySelectorAll('.sp-tier-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tierValue = btn.dataset.tier; // 'community' | 'advocate' | 'champion' | 'legacy'
        const select    = document.getElementById('spPackage');

        if (select && tierValue) {
            select.value = tierValue;

            // Flash the select green so the user sees it updated
            select.style.transition = 'border-color 0.2s ease, box-shadow 0.2s ease';
            select.style.borderColor = '#006b3f';
            select.style.boxShadow = '0 0 0 3px rgba(0,107,63,0.15)';
            setTimeout(() => {
                select.style.borderColor = '';
                select.style.boxShadow = '';
            }, 1800);
        }

        // Scroll to form
        document.getElementById('sp-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ── INQUIRY FORM SUBMIT ──────────────────────────────
document.getElementById('sponsorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('.sp-form-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    const data = {
        firstName: document.getElementById('spFirstName').value,
        lastName:  document.getElementById('spLastName').value,
        email:     document.getElementById('spEmail').value,
        package:   document.getElementById('spPackage').value,
        message:   document.getElementById('spMessage').value,
    };

    try {
        // Replace with your actual form endpoint (Formspree, EmailJS, etc.)
        const res = await fetch('YOUR_FORM_ENDPOINT', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Inquiry Sent!';
            submitBtn.style.background = '#444440';
            e.target.reset();
        } else {
            throw new Error('Server error');
        }
    } catch (err) {
        console.error('Form error:', err);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Inquiry';
        alert('Something went wrong. Please email us directly at ucalgaryghsa@gmail.com');
    }
});