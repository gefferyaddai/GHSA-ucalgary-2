/* ============================================================
   GHSA — Become a Sponsor Page JS (Updated)
   ============================================================ */

// ── STRIPE CONFIG ────────────────────────────────────
// Replace with your actual Stripe publishable key
const STRIPE_PUBLIC_KEY = 'pk_test_51TGS7QGb9hE0roO1f9XxCfgkbh5EoXj3OfOuuUfRLP4VdnlTmykdf6JC4x6uwIrx45WmXDmr1BRXrwjoJEQ2hToT0031KgiuP3';
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
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Redirecting to Stripe...';

    try {
        const res = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount:    selectedAmount * 100, // Stripe uses cents
                currency:  'cad',
                frequency: donationFrequency,    // 'one-time' | 'monthly'
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Server error');
        }

        const { sessionId } = await res.json();
        await stripe.redirectToCheckout({ sessionId });

    } catch (err) {
        console.error('Stripe error:', err);
        btn.disabled = false;
        const suffix = donationFrequency === 'monthly' ? '/mo' : '';
        btn.innerHTML = `<i class="fa-solid fa-heart"></i> <span id="donateBtnLabel">Donate $${selectedAmount}${suffix}</span>`;
        alert('Something went wrong. Please try again or contact us directly at ucalgaryghsa@gmail.com');
    }
});

// ── HANDLE SUCCESS / CANCEL REDIRECTS ────────────────
(function handleRedirects() {
    const params = new URLSearchParams(window.location.search);

    // One-time success — show a thank-you toast
    if (params.get('success') === 'true') {
        showToast('🎉 Thank you for your donation! A receipt has been emailed to you.');
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
    }

    // Cancelled — show a message
    if (params.get('cancelled') === 'true') {
        showToast('Payment was cancelled. No charge was made.', 'neutral');
        window.history.replaceState({}, '', window.location.pathname);
    }
})();

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 16px 28px;
        border-radius: 12px;
        font-family: 'DM Sans', sans-serif;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 9999;
        max-width: 500px;
        text-align: center;
        animation: toastIn 0.4s ease;
        ${type === 'success'
        ? 'background: #006b3f; color: white;'
        : 'background: #444440; color: white;'}
    `;
    toast.textContent = message;

    // Animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}

// ── TIER SELECT — AUTO-FILL FORM ─────────────────────
document.querySelectorAll('.sp-tier-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tierValue = btn.dataset.tier;
        const select    = document.getElementById('spPackage');

        if (select && tierValue) {
            select.value = tierValue;
            select.style.transition = 'border-color 0.2s ease, box-shadow 0.2s ease';
            select.style.borderColor = '#006b3f';
            select.style.boxShadow = '0 0 0 3px rgba(0,107,63,0.15)';
            setTimeout(() => {
                select.style.borderColor = '';
                select.style.boxShadow = '';
            }, 1800);
        }

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
        // Replace with your Formspree endpoint or backend
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