/* ── WWO card scroll-in animation ──────────────────── */
const cards      = document.querySelectorAll('.wwo-card');
const wwoSection = document.querySelector('.wwo-cards');

if (wwoSection && cards.length) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                cards.forEach((card, i) => {
                    setTimeout(() => card.classList.add('show'), i * 120);
                });
            } else {
                cards.forEach(card => card.classList.remove('show'));
            }
        });
    }, { threshold: 0.15 });

    observer.observe(wwoSection);
}

/* ── Sponsor photos scroll-in animation ────────────── */
const sponsorPhotos = document.querySelectorAll('.sponsor-photo-card');

if (sponsorPhotos.length) {
    const photoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            } else {
                // Remove so animation replays next time you scroll in
                entry.target.classList.remove('in-view');
            }
        });
    }, { threshold: 0.2 });

    sponsorPhotos.forEach(photo => photoObserver.observe(photo));
}

/* ── Newsletter — Mailchimp ─────────────────────────── */
// Newsletter form — separate Mailchimp audience (First Name + Last Name + Email)
const MAILCHIMP_URL = 'https://gmail.us22.list-manage.com/subscribe/post?u=0f393d7af469c9798babf3f29&id=9734ce82ad&f_id=00e7c2e1f0';

const newsletterForm = document.getElementById('newsletterForm');
const newsletterBtn  = newsletterForm ? newsletterForm.querySelector('.newsletter-btn') : null;

if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName  = document.getElementById('lastName').value.trim();
        const email     = document.getElementById('email').value.trim();

        const originalBtnText = newsletterBtn.textContent;
        newsletterBtn.disabled = true;
        newsletterBtn.textContent = 'Signing you up...';

        try {
            const params = new URLSearchParams({
                FNAME:     firstName,
                LNAME:     lastName,
                EMAIL:     email,
                tags:      'get-newsletter',
                subscribe: 'Subscribe',
            });

            await fetch(`${MAILCHIMP_URL}&${params.toString()}`, {
                method: 'GET',
                mode:   'no-cors',
            });

            // Success
            newsletterBtn.textContent       = '✓ You\'re subscribed!';
            newsletterBtn.style.background  = '#444440';
            newsletterForm.reset();

            setTimeout(() => {
                newsletterBtn.disabled         = false;
                newsletterBtn.textContent      = originalBtnText;
                newsletterBtn.style.background = '';
            }, 4000);

        } catch (err) {
            console.error('Newsletter error:', err);
            newsletterBtn.disabled    = false;
            newsletterBtn.textContent = originalBtnText;
            showToast('Something went wrong. Please email ucalgaryghsa@gmail.com to subscribe.', 'error');
        }
    });
}

// ── EVENT POPUPS ─────────────────────────────────────
// Each shows on every load through its last day, one after another. Only the X closes them.
const EVENT_POPUPS = [
    { id: 'racePopup',   end: new Date(2026, 10, 21, 0, 0, 0) }, // Amazing Race, through Nov 20
    { id: 'bottlePopup', end: new Date(2026, 10, 17, 0, 0, 0) }, // Bottle Drive, through Nov 16
];

const activePopups = EVENT_POPUPS
    .filter(popup => new Date() < popup.end)
    .map(popup => document.getElementById(popup.id))
    .filter(Boolean);

if (activePopups.length) {
    const pageContent = Array.from(document.body.children).filter(el => !el.classList.contains('event-popup-overlay') && el.tagName !== 'SCRIPT');

    function showPopup(index) {
        const popup = activePopups[index];

        if (!popup) {
            document.body.style.overflow = '';
            pageContent.forEach(el => { el.inert = false; });
            return;
        }

        const closeBtn = popup.querySelector('.event-popup-close');
        popup.classList.add('open');
        closeBtn.focus();
        closeBtn.addEventListener('click', () => {
            popup.classList.remove('open');
            showPopup(index + 1);
        }, { once: true });
    }

    document.body.style.overflow = 'hidden';
    pageContent.forEach(el => { el.inert = true; });
    showPopup(0);
}
