/* ============================================================
   GHSA — Events Page JS
   ============================================================ */

// ── COUNTDOWN CONFIG ─────────────────────────────────
// Set your next event date here (YYYY, MM-1, DD, HH, MM, SS)
// Month is 0-indexed: Jan=0, Feb=1 ... Dec=11
const NEXT_EVENT = {
    name: "Cultural Night 2026",
    date: new Date(2026, 10, 14, 18, 0, 0), // Nov 14 2026, 6:00 PM
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
        // Event has passed or is happening now
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

    const daysEl = document.getElementById('cdDays');
    const hoursEl = document.getElementById('cdHours');
    const minsEl = document.getElementById('cdMinutes');
    const secsEl = document.getElementById('cdSeconds');

    if (daysEl)  daysEl.textContent  = pad(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minsEl)  minsEl.textContent  = pad(minutes);
    if (secsEl)  secsEl.textContent  = pad(seconds);

    // hide the config note once countdown is running
    if (note) note.style.display = 'none';
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ── NOTIFY BUTTON ────────────────────────────────────
const notifyBtn = document.getElementById('notifyBtn');
if (notifyBtn) {
    notifyBtn.addEventListener('click', () => {
        // Replace this with your actual notification signup logic
        // e.g. open a modal, redirect to a form, or trigger an email signup
        const original = notifyBtn.innerHTML;
        notifyBtn.innerHTML = '<i class="fa-solid fa-check"></i> You\'re on the list!';
        notifyBtn.style.background = '#444440';
        notifyBtn.disabled = true;

        setTimeout(() => {
            notifyBtn.innerHTML = original;
            notifyBtn.style.background = '';
            notifyBtn.disabled = false;
        }, 3000);
    });
}