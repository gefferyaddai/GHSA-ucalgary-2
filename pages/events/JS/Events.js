/* ============================================================
   GHSA — Events Page JS
   ============================================================ */

// ── COUNTDOWN CONFIG ─────────────────────────────────
// Update name and date when your next event is confirmed
// Month is 0-indexed: Jan=0, Feb=1 ... Dec=11
const NEXT_EVENT = {
    name: "Ghana Independence Day GALA 2027",
    date: new Date(2027, 2, 6, 18, 0, 0), // March 6 2027, 6:00 PM
};

// ── COUNTDOWN TIMER ──────────────────────────────────
function pad(n) {
    return String(n).padStart(2, '0');
}

function updateCountdown() {
    const now  = new Date();
    const diff = NEXT_EVENT.date - now;
    const note = document.getElementById('countdownNote');
    const name = document.getElementById('countdownEventName');

    if (name) name.textContent = NEXT_EVENT.name;

    if (diff <= 0) {
        ['cdDays','cdHours','cdMinutes','cdSeconds'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '00';
        });
        if (note) note.textContent = "This event is happening now! 🎉";
        return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const daysEl  = document.getElementById('cdDays');
    const hoursEl = document.getElementById('cdHours');
    const minsEl  = document.getElementById('cdMinutes');
    const secsEl  = document.getElementById('cdSeconds');

    if (daysEl)  daysEl.textContent  = pad(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minsEl)  minsEl.textContent  = pad(minutes);
    if (secsEl)  secsEl.textContent  = pad(seconds);

    if (note) note.style.display = 'none';
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ── GET NOTIFIED MODAL — MAILCHIMP ───────────────────
// Your Mailchimp embedded form action URL
const MAILCHIMP_URL = 'https://gmail.us22.list-manage.com/subscribe/post?u=0f393d7af469c9798babf3f29&id=9734ce82ad&f_id=00e0c2e1f0';

const notifyModal    = document.getElementById('notifyModal');
const notifyBtn      = document.getElementById('notifyBtn');
const modalClose     = document.getElementById('notifyModalClose');
const notifyForm     = document.getElementById('notifyForm');
const formState      = document.getElementById('notifyFormState');
const successState   = document.getElementById('notifySuccessState');

function openNotifyModal() {
    notifyModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        const firstInput = document.getElementById('notifyFirstName');
        if (firstInput) firstInput.focus();
    }, 300);
}

function closeNotifyModal() {
    notifyModal.classList.remove('open');
    document.body.style.overflow = '';
}

function resetModal() {
    formState.style.display    = 'block';
    successState.style.display = 'none';
    notifyForm.reset();
    const btn = notifyForm.querySelector('.notify-submit-btn');
    if (btn) {
        btn.disabled = false;
        document.getElementById('notifySubmitLabel').textContent = 'Notify Me';
    }
}

// Open
notifyBtn.addEventListener('click', openNotifyModal);

// Close — X button
modalClose.addEventListener('click', closeNotifyModal);

// Close — backdrop click
notifyModal.addEventListener('click', (e) => {
    if (e.target === notifyModal) closeNotifyModal();
});

// Close — Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && notifyModal.classList.contains('open')) closeNotifyModal();
});

// Reset form when modal finishes closing
notifyModal.addEventListener('transitionend', () => {
    if (!notifyModal.classList.contains('open')) resetModal();
});

// ── FORM SUBMIT → MAILCHIMP ──────────────────────────
notifyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn   = notifyForm.querySelector('.notify-submit-btn');
    const submitLabel = document.getElementById('notifySubmitLabel');
    const firstName   = document.getElementById('notifyFirstName').value.trim();
    const email       = document.getElementById('notifyEmail').value.trim();

    submitBtn.disabled = true;
    submitLabel.textContent = 'Signing you up...';

    try {
        // Mailchimp requires a GET request with no-cors for browser submissions
        const params = new URLSearchParams({
            FNAME:     firstName,
            EMAIL:     email,
            tags:      'get-event-notification',
            subscribe: 'Subscribe',
        });

        await fetch(`${MAILCHIMP_URL}&${params.toString()}`, {
            method: 'GET',
            mode: 'no-cors',
        });

        // Show success (fetch with no-cors always resolves — Mailchimp receives it)
        formState.style.display    = 'none';
        successState.style.display = 'block';

        // Auto-close after 3 seconds
        setTimeout(() => closeNotifyModal(), 3000);

    } catch (err) {
        console.error('Mailchimp error:', err);
        submitBtn.disabled = false;
        submitLabel.textContent = 'Notify Me';
        alert('Something went wrong. Please email ucalgaryghsa@gmail.com to be added to the list.');
    }
});