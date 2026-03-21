/* ── Navbar scroll shrink ──────────────────────────── */
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ── Hamburger toggle ──────────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
});

// Close on link click (mobile)
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
    });
});

/* ── WWO card scroll-in animation ──────────────────── */
const cards = document.querySelectorAll('.wwo-card');
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