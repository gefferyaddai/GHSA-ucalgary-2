/* ============================================================
   GHSA — Events Page JS
   ============================================================ */

// ── COUNTDOWN CONFIG ─────────────────────────────────
// Set to null when there is no upcoming event.
const NEXT_EVENT = null;
// Example when an event is scheduled:
// const NEXT_EVENT = { name: "Event Name", date: new Date(2026, 6, 3, 16, 0, 0) };

// ── COUNTDOWN TIMER ──────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
    const note = document.getElementById('countdownNote');
    const name = document.getElementById('countdownEventName');
    const grid = document.querySelector('.countdown-grid');

    if (!NEXT_EVENT) {
        if (name) name.textContent = 'No Upcoming Events';
        if (grid) grid.style.display = 'none';
        if (note) {
            note.style.display = 'block';
            note.textContent = "We'll announce the next one soon — check back or get notified above.";
        }
        return;
    }

    const now  = new Date();
    const diff = NEXT_EVENT.date - now;

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
if (NEXT_EVENT) setInterval(updateCountdown, 1000);

// ── EVENT RECAP CAROUSEL ─────────────────────────────
const recapModal   = document.getElementById('recapModal');
const recapBtn     = document.getElementById('recapBtn');
const recapClose   = document.getElementById('recapClose');
const recapTrack   = document.getElementById('recapTrack');
const recapPrev    = document.getElementById('recapPrev');
const recapNext    = document.getElementById('recapNext');
const recapDots    = document.getElementById('recapDots');
const recapCounter = document.getElementById('recapCounter');

if (recapModal && recapBtn) {
    const slideCount = recapTrack.children.length;
    let recapIndex = 0;

    // Build dots
    for (let i = 0; i < slideCount; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        recapDots.appendChild(dot);
    }

    function renderRecap() {
        recapTrack.style.transform = `translateX(-${recapIndex * 100}%)`;
        recapCounter.textContent = `${recapIndex + 1} / ${slideCount}`;
        recapPrev.disabled = recapIndex === 0;
        recapNext.disabled = recapIndex === slideCount - 1;
        Array.from(recapDots.children).forEach((dot, i) => {
            dot.classList.toggle('active', i === recapIndex);
        });
    }

    function goToSlide(i) {
        recapIndex = Math.max(0, Math.min(slideCount - 1, i));
        renderRecap();
    }

    function openRecap() {
        recapModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        goToSlide(0);
    }

    function closeRecap() {
        recapModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    recapBtn.addEventListener('click', openRecap);
    recapClose.addEventListener('click', closeRecap);
    recapPrev.addEventListener('click', () => goToSlide(recapIndex - 1));
    recapNext.addEventListener('click', () => goToSlide(recapIndex + 1));
    recapModal.addEventListener('click', (e) => { if (e.target === recapModal) closeRecap(); });
    document.addEventListener('keydown', (e) => {
        if (!recapModal.classList.contains('open')) return;
        if (e.key === 'Escape')     closeRecap();
        if (e.key === 'ArrowLeft')  goToSlide(recapIndex - 1);
        if (e.key === 'ArrowRight') goToSlide(recapIndex + 1);
    });

    renderRecap();
}

// ── GET NOTIFIED MODAL — MAILCHIMP ───────────────────
const MAILCHIMP_URL = 'https://gmail.us22.list-manage.com/subscribe/post?u=0f393d7af469c9798babf3f29&id=9734ce82ad&f_id=00e0c2e1f0';

const notifyModal  = document.getElementById('notifyModal');
const notifyBtn    = document.getElementById('notifyBtn');
const modalClose   = document.getElementById('notifyModalClose');
const notifyForm   = document.getElementById('notifyForm');
const formState    = document.getElementById('notifyFormState');
const successState = document.getElementById('notifySuccessState');

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

notifyBtn.addEventListener('click', openNotifyModal);
modalClose.addEventListener('click', closeNotifyModal);
notifyModal.addEventListener('click', (e) => { if (e.target === notifyModal) closeNotifyModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && notifyModal.classList.contains('open')) closeNotifyModal(); });
notifyModal.addEventListener('transitionend', () => { if (!notifyModal.classList.contains('open')) resetModal(); });

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

        formState.style.display    = 'none';
        successState.style.display = 'block';
        setTimeout(() => closeNotifyModal(), 3000);

    } catch (err) {
        console.error('Mailchimp error:', err);
        submitBtn.disabled = false;
        submitLabel.textContent = 'Notify Me';
        showToast('Something went wrong. Please email ucalgaryghsa@gmail.com to be added to the list.', 'error');
    }
});