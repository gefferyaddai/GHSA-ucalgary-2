/* ============================================================
   GHSA — Become a Sponsor Page JS (Updated)
   ============================================================ */

// ── STRIPE CONFIG ────────────────────────────────────
// Replace with your actual Stripe publishable key
const STRIPE_PUBLIC_KEY = 'pk_live_51THcoVArlGoBWXv8RxNPoK4AXySapBwf602nbRvIEISnuPA5uQvaxgqeiQw6wcoywRxSbd8RteBN1HTka7kw4m3C000cgfZwOk';
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
        showToast('Something went wrong. Please try again or contact us directly at ucalgaryghsa@gmail.com', 'error');
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
        const res = await fetch('/api/submit-sponsor-inquiry', {
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
        showToast('Something went wrong. Please email us directly at ucalgaryghsa@gmail.com', 'error');
    }
});