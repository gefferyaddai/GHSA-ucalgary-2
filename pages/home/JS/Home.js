
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
            alert('Something went wrong. Please email ucalgaryghsa@gmail.com to subscribe.');
        }
    });
}